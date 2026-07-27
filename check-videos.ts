import { prisma } from './src/lib/prisma'

async function main() {
  const videos = await prisma.mediaAsset.findMany({
    where: { mime_type: { startsWith: 'video/' } },
    orderBy: { createdAt: 'desc' },
    take: 2,
  })
  console.log('Videos found:', videos.length)
  videos.forEach(v => console.log(`- ${v.filename}: ${v.mime_type}`))
}

main()
  .catch(e => console.error(e))
  .finally(() => process.exit())