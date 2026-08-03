import { prisma } from '@/lib/prisma'

export type DisplayImage = {
  url: string
  alt_text: string | null
  focal_x: number
  focal_y: number
}

/** Recent library photos — display filler for tiles and cards (allow-listed fields). */
export async function getRecentImages(limit = 12): Promise<DisplayImage[]> {
  try {
    return await prisma.mediaAsset.findMany({
      where: { mime_type: { startsWith: 'image/' } },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { url: true, alt_text: true, focal_x: true, focal_y: true },
    })
  } catch {
    return []
  }
}
