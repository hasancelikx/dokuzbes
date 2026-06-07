import { FastifyInstance } from 'fastify'
import { tokenDogrula } from '@dokuzbes/auth-middleware'
import { db } from '../lib/db'
import { iyzico, paketBul } from '../lib/iyzico'
import { AppError } from '@dokuzbes/errors'
import { z } from 'zod'
import { randomUUID } from 'crypto'

const satinAlSchema = z.object({
  paketId: z.string(),
  kart: z.object({
    isim: z.string().min(3),
    numara: z.string().regex(/^\d{16}$/),
    sonAyYil: z.string().regex(/^\d{2}\/\d{2}$/),
    cvv: z.string().regex(/^\d{3,4}$/),
  }),
  // İyzico'nun gerektirdiği fatura bilgileri
  fatura: z.object({
    ad: z.string().min(2),
    soyad: z.string().min(2),
    telefon: z.string().regex(/^05\d{9}$/),
    adres: z.string().min(5),
    sehir: z.string().min(2),
    ulke: z.string().default('Turkey'),
  }),
})

export async function satinAlRoute(app: FastifyInstance) {
  // POST /payment/satin-al — gold satın al
  app.post('/payment/satin-al', { preHandler: tokenDogrula }, async (req: any) => {
    const parsed = satinAlSchema.safeParse(req.body)
    if (!parsed.success) {
      throw new AppError('GECERSIZ_VERI', 400, JSON.stringify(parsed.error.flatten()))
    }

    const { paketId, kart, fatura } = parsed.data
    const paket = paketBul(paketId)
    if (!paket) throw new AppError('PAKET_YOK', 404)

    const user = await db.user.findUnique({
      where: { id: req.kullanici.userId },
      select: { id: true, email: true, nickname: true },
    })
    if (!user) throw new AppError('KULLANICI_YOK', 404)

    const conversationId = randomUUID()
    const [sonAy, sonYil] = kart.sonAyYil.split('/')

    // İyzico ödeme isteği
    const odemeIstegi = {
      locale: 'tr',
      conversationId,
      price: paket.fiyatTL,
      paidPrice: paket.fiyatTL,
      currency: 'TRY',
      installment: '1',
      basketId: paketId,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      paymentCard: {
        cardHolderName: kart.isim,
        cardNumber: kart.numara,
        expireMonth: sonAy,
        expireYear: `20${sonYil}`,
        cvc: kart.cvv,
        registerCard: '0',
      },
      buyer: {
        id: user.id,
        name: fatura.ad,
        surname: fatura.soyad,
        gsmNumber: `+9${fatura.telefon}`,
        email: user.email ?? `${user.nickname}@dokuzbes.app`,
        identityNumber: '11111111111',
        registrationAddress: fatura.adres,
        city: fatura.sehir,
        country: fatura.ulke,
        ip: req.ip,
      },
      shippingAddress: {
        contactName: `${fatura.ad} ${fatura.soyad}`,
        city: fatura.sehir,
        country: fatura.ulke,
        address: fatura.adres,
      },
      billingAddress: {
        contactName: `${fatura.ad} ${fatura.soyad}`,
        city: fatura.sehir,
        country: fatura.ulke,
        address: fatura.adres,
      },
      basketItems: [
        {
          id: paketId,
          name: `${paket.gold} Gold Paketi`,
          category1: 'Sanal Para',
          itemType: 'VIRTUAL',
          price: paket.fiyatTL,
        },
      ],
    }

    return new Promise((resolve, reject) => {
      iyzico.payment.create(odemeIstegi, async (err: any, result: any) => {
        if (err) {
          app.log.error(err)
          return reject(new AppError('ODEME_HATASI', 500))
        }

        if (result.status !== 'success') {
          return reject(new AppError(
            result.errorCode ?? 'ODEME_REDDEDILDI',
            400,
            result.errorMessage ?? 'Ödeme reddedildi',
          ))
        }

        const paymentId = result.paymentId

        // Idempotency: aynı paymentId tekrar işlenmesin
        const oncekiIslem = await db.processedPayment.findUnique({ where: { paymentId } })
        if (oncekiIslem) {
          return resolve({ basarili: true, mesaj: 'Zaten işlendi', goldEklendi: oncekiIslem.goldEklendi })
        }

        const toplamGold = paket.gold + paket.bonus

        // Atomik: gold ekle + kayıt oluştur
        await db.$transaction([
          db.user.update({
            where: { id: user.id },
            data: {
              gold: { increment: toplamGold },
              totalSpent: { increment: Math.round(parseFloat(paket.fiyatTL)) },
            },
          }),
          db.transaction.create({
            data: {
              userId: user.id,
              tur: 'gold_satin_al',
              miktar: toplamGold,
              aciklama: `${paket.gold} gold satın alındı (${paket.bonus} bonus)`,
            },
          }),
          db.processedPayment.create({
            data: { paymentId, userId: user.id, paketId, goldEklendi: toplamGold },
          }),
        ])

        resolve({
          basarili: true,
          goldEklendi: toplamGold,
          mesaj: `${toplamGold} gold hesabınıza eklendi`,
        })
      })
    })
  })
}
