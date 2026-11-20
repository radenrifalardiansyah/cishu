import { timingSafeEqual } from 'crypto';
import { getSql, parseJsonb } from '@/lib/db';
import { type InvoiceData } from '@/lib/pdf/InvoicePDF';

type StoredInvoice = Omit<InvoiceData, 'logo'> & { createdAt: string; token?: string };

interface InvoiceRow {
  invoice_no: string; date: string; customer_name: string; customer_phone: string;
  items: unknown; subtotal: string; discount: unknown; total: string;
  source: string | null; payment_status: string | null; token: string | null; created_at: Date;
}

// Link invoice publik memuat token acak (?t=...) — nomor invoice berurutan/mudah ditebak, jadi
// tanpa token siapa pun bisa membuka invoice (nama, HP, isi belanja) pelanggan lain. Invoice lama
// tanpa token tetap terbuka supaya link yang sudah terkirim tidak putus.
//
// Storefront hanya MEMBACA invoice: pembuatannya terautentikasi dari cishu-admin (/api/pos/invoice).
// Tidak ada endpoint publik untuk menulis invoice.
// Cocokkan token dari link dengan token invoice (constant-time). Invoice tanpa token (lama) lolos.
export function invoiceTokenOk(saved: { token?: string }, provided: string | null): boolean {
  if (!saved.token) return true;
  if (!provided) return false;
  const a = Buffer.from(saved.token);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function getInvoice(id: string): Promise<StoredInvoice | null> {
  const sql = getSql();
  const [row] = await sql<InvoiceRow[]>`select * from invoices where invoice_no = ${id}`;
  if (!row) return null;
  return {
    invoiceNo: row.invoice_no, date: row.date, customerName: row.customer_name, customerPhone: row.customer_phone,
    items: (parseJsonb(row.items) as InvoiceData['items'] | null) ?? [],
    subtotal: Number(row.subtotal),
    discount: (parseJsonb(row.discount) as InvoiceData['discount'] | null) ?? undefined,
    total: Number(row.total),
    source: (row.source as InvoiceData['source']) ?? undefined,
    paymentStatus: (row.payment_status as InvoiceData['paymentStatus']) ?? undefined,
    token: row.token ?? undefined,
    createdAt: row.created_at.toISOString(),
  };
}
