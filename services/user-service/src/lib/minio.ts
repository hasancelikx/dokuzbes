import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomUUID } from 'crypto'

export const s3 = new S3Client({
  region: 'eu-west-3',
  endpoint: process.env.AWS_ENDPOINT_URL ?? 'http://localhost:9000',
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? 'minioadmin',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? 'minioadmin',
  },
})

export async function avatarYukle(buffer: Buffer, mimeType: string): Promise<string> {
  const uzanti = mimeType.includes('png') ? 'png' : 'jpg'
  const dosyaAdi = `avatars/${randomUUID()}.${uzanti}`

  await s3.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET_NAME ?? 'dokuzbes-media-dev',
    Key: dosyaAdi,
    Body: buffer,
    ContentType: mimeType,
  }))

  const endpoint = process.env.AWS_ENDPOINT_URL ?? 'http://localhost:9000'
  return `${endpoint}/${process.env.S3_BUCKET_NAME ?? 'dokuzbes-media-dev'}/${dosyaAdi}`
}
