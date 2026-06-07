import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  // Kullanıcıları listele
  const users = await db.user.findMany({
    select: { id: true, email: true, role: true },
    orderBy: { createdAt: 'asc' },
    take: 10,
  })
  console.log('Mevcut kullanıcılar:')
  users.forEach((u) => console.log(`  ${u.email}  →  ${u.role}  [${u.id}]`))

  // testkullanici'yi admin yap
  const hedef = users.find((u) => u.email?.includes('testkullanici') || u.email?.includes('musteri'))
  if (!hedef) {
    console.log('\nAdmin yapılacak kullanıcı bulunamadı.')

    // Yoksa yeni admin kullanıcı oluştur
    const bcrypt = await import('bcryptjs')
    const hash = await bcrypt.hash('Admin1234!', 10)
    const yeni = await db.user.create({
      data: {
        email: 'admin@dokuzbes.app',
        passwordHash: hash,
        role: 'admin',
        status: 'active',
        gold: 0,
      },
    })
    console.log(`\nYeni admin oluşturuldu: admin@dokuzbes.app / Admin1234! [${yeni.id}]`)
    return
  }

  await db.user.update({ where: { id: hedef.id }, data: { role: 'admin' } })
  console.log(`\n✓ ${hedef.email} artık admin`)
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect())
