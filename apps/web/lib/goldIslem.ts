// Gold işlem (transaction) tipleri + gold-service GET /gold/gecmis eşlemesi.
// Tek kaynak — hem /gold hem /hesabim/gecmis bunu kullanır (DRY).

export type IslemTip = 'yukle' | 'odeme' | 'hediye' | 'kazanc'

export interface Islem {
  id: string
  tip: IslemTip
  aciklama: string
  miktar: number
  tarih: string
}

// gold-service GET /gold/gecmis dönüşü (Transaction kaydı)
export interface GecmisDTO {
  id: string
  tur: string
  miktar: number
  aciklama: string | null
  createdAt: string
}

// Backend `tur` → UI tip eşlemesi (gold-service transaction.create çağrılarına göre)
const TUR_TIP: Record<string, IslemTip> = {
  gold_satin_al: 'yukle',
  harcama:       'odeme',
  hediye_gonder: 'hediye',
  iade:          'kazanc',
  bonus:         'kazanc',
}

const TIP_VARSAYILAN: Record<IslemTip, string> = {
  yukle:  'Gold yükleme',
  odeme:  'Masa ödemesi',
  hediye: 'Hediye',
  kazanc: 'Kazanç',
}

export function mapIslem(d: GecmisDTO): Islem {
  const tip = TUR_TIP[d.tur] ?? (d.miktar >= 0 ? 'kazanc' : 'odeme')
  return {
    id: d.id,
    tip,
    aciklama: d.aciklama?.trim() || TIP_VARSAYILAN[tip],
    miktar: d.miktar,
    tarih: new Date(d.createdAt).toLocaleDateString('tr-TR'),
  }
}
