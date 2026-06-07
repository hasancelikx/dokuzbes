import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function main() {
  // 1. Yeni bir müşteri kullanıcısı oluştur
  const musteriMevcut = await db.user.findUnique({ where: { email: 'musteri2@dokuzbes.app' } })
  if (!musteriMevcut) {
    const hash = await bcrypt.hash('Test1234!', 10)
    await db.user.create({
      data: {
        email: 'musteri2@dokuzbes.app',
        passwordHash: hash,
        nickname: 'Musteri2',
        role: 'customer',
        status: 'active',
        gold: 500,
      },
    })
    console.log('✓ musteri2@dokuzbes.app oluşturuldu (500 gold)')
  }

  // 2. musteri@dokuzbes.app kullanıcısını performer yap (performer kaydı yoksa oluştur)
  const performerKullanici = await db.user.findUnique({
    where: { email: 'musteri@dokuzbes.app' },
    include: { performer: true },
  })

  if (performerKullanici) {
    await db.user.update({
      where: { email: 'musteri@dokuzbes.app' },
      data: { role: 'performer' },
    })
    console.log('✓ musteri@dokuzbes.app rolü performer yapıldı')

    if (!performerKullanici.performer) {
      await db.performer.create({
        data: {
          userId: performerKullanici.id,
          stageName: 'Selin Yıldız',
          bio: 'Test performer',
          city: 'İstanbul',
          category: 'sohbet',
          durum: 'online',
        },
      })
      console.log('✓ Performer kaydı oluşturuldu: Selin Yıldız')
    } else {
      await db.performer.update({
        where: { id: performerKullanici.performer.id },
        data: { durum: 'online' },
      })
      console.log('✓ Performer durumu online yapıldı')
    }
  }

  // 3. Özet
  console.log('\n--- Test Hesapları ---')
  console.log('Müşteri:   musteri2@dokuzbes.app / Test1234!')
  console.log('Performer: musteri@dokuzbes.app  / Test1234!')
  console.log('Admin:     testkullanici@dokuzbes.app / Test1234!')

  await db.$disconnect()
}

main().catch(console.error)
