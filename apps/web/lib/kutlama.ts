// Kutlama tetikleyici — anlamlı anlarda (hediye vb.) şampanya patlamasını oynatır.
// <KutlamaKatmani /> bu olayı dinler (components/ui/SampanyaPatlamasi.tsx).
export function kutlamaPatlat() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('db:kutlama'))
  }
}
