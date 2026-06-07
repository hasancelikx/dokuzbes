import { PrismaClient } from '@prisma/client'
const db = new PrismaClient()
async function main() {
  const masalar = await db.masa.findMany({
    orderBy: { id: 'desc' },
    take: 3,
    select: { id: true, durum: true, musteriId: true, yayinciId: true, tur: true },
  })
  console.log(JSON.stringify(masalar, null, 2))
  await db.$disconnect()
}
main().catch(console.error)
