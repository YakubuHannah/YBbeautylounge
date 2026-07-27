import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { requireAdminSession } from '@/lib/auth/admin-session'

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminSession()
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = (await req.json()) as {
    product_id: string
    image_id: string
    display_name?: string
    alt_text?: string
  }

  if (!body.product_id || !body.image_id) {
    return NextResponse.json({ error: 'product_id and image_id required' }, { status: 400 })
  }

  const image = await prisma.productImage.findUnique({
    where: { id: body.image_id },
  })

  if (!image || image.product_id !== body.product_id) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  if (body.alt_text !== undefined && !body.alt_text.trim()) {
    return NextResponse.json({ error: 'Alt text cannot be empty' }, { status: 400 })
  }

  const updated = await prisma.productImage.update({
    where: { id: body.image_id },
    data: {
      display_name: body.display_name?.trim(),
      alt_text: body.alt_text?.trim(),
    },
  })

  return NextResponse.json({ image: updated })
}