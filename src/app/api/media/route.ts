import { NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const assets = await prisma.mediaAsset.findMany({
    select: {
      id: true,
      url: true,
      filename: true,
      mime_type: true,
      alt_text: true,
      focal_x: true,
      focal_y: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return NextResponse.json({ assets })
}