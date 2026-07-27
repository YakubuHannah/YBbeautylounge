import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const saltRounds = 12

  const adminPassword = 'admin123'
  const hashedPassword = await bcrypt.hash(adminPassword, saltRounds)

  const adminUser = await prisma.adminUser.upsert({
    where: { email: 'admin@ybbeautylounge.com' },
    update: {},
    create: {
      email: 'admin@ybbeautylounge.com',
      password_hash: hashedPassword,
      name: 'Founder',
      role: 'admin'
    }
  })

  const settings = await prisma.setting.createMany({
    data: [
      { key: 'vat_rate', value: 7.5, value_type: 'number' },
      { key: 'vat_inclusive', value: false, value_type: 'boolean' },
      { key: 'free_delivery_threshold', value: 200000, value_type: 'number' },
      { key: 'deposit_percentage', value: 50, value_type: 'number' },
      { key: 'restoration_capacity_cap', value: 5, value_type: 'number' },
      { key: 'referral_referee_discount', value: 5000, value_type: 'number' },
      { key: 'referral_min_order', value: 50000, value_type: 'number' },
      { key: 'referral_reward', value: 10000, value_type: 'number' },
      { key: 'referral_monthly_cap', value: 5, value_type: 'number' },
      { key: 'stock_expiry_minutes', value: 15, value_type: 'number' },
      { key: 'payment_timeout_hours', value: 1, value_type: 'number' },
      { key: 'returns_window_days', value: 30, value_type: 'number' },
      { key: 'site_url', value: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000', value_type: 'string' },
      { key: 'whatsapp_number', value: '2348000000000', value_type: 'string' }
    ],
    skipDuplicates: true
  })

  await prisma.deliveryZone.createMany({
    data: [
      { name: 'Lagos', states: ['Lagos'], fee: 0, estimated_days: '1-2' },
      { name: 'South-West', states: ['Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'], fee: 2000, estimated_days: '2-4' },
      { name: 'Other Nigeria', states: [], fee: 3000, estimated_days: '3-5' },
      { name: 'International', states: ['Ghana', 'UK', 'US'], fee: 10000, estimated_days: '7-14' }
    ],
    skipDuplicates: true
  })

  const product = await prisma.product.create({
    data: {
      name: 'YB Beauty Lounge Bone Straight Wig',
      slug: 'yb-beauty-lounge-bone-straight-wig',
      description: 'Premium bone straight wig with natural shine and comfortable cap',
      texture: 'bone_straight',
      hair_origin: 'Brazilian',
      care_instructions: 'Use sulfate-free shampoo, condition thoroughly, avoid excessive heat',
      status: 'active',
      featured: true,
      track_inventory: true,
      avg_rating: 0,
      review_count: 0,
      published_at: new Date()
    }
  })

  const variants = await prisma.productVariant.createMany({
    data: [
      {
        product_id: product.id,
        sku: 'BS-16-BRN',
        length_inches: 16,
        colorway: 'Brown',
        density_percent: 150,
        draw_type: 'double_drawn',
        lace_type: 'hd',
        lace_size: '13x6',
        cap_size: 'medium',
        hair_grade: '7a',
        is_pre_plucked: true,
        can_be_coloured: true,
        price: 18500000,
        cost_price: 8500000,
        stock_quantity: 10,
        low_stock_threshold: 2,
        weight_grams: 250,
        is_active: true
      },
      {
        product_id: product.id,
        sku: 'BS-18-BRN',
        length_inches: 18,
        colorway: 'Brown',
        density_percent: 150,
        draw_type: 'double_drawn',
        lace_type: 'hd',
        lace_size: '13x6',
        cap_size: 'medium',
        hair_grade: '7a',
        is_pre_plucked: true,
        can_be_coloured: true,
        price: 19500000,
        cost_price: 9000000,
        stock_quantity: 8,
        low_stock_threshold: 2,
        weight_grams: 280,
        is_active: true
      },
      {
        product_id: product.id,
        sku: 'BS-20-BRN',
        length_inches: 20,
        colorway: 'Brown',
        density_percent: 150,
        draw_type: 'double_drawn',
        lace_type: 'hd',
        lace_size: '13x6',
        cap_size: 'medium',
        hair_grade: '7a',
        is_pre_plucked: true,
        can_be_coloured: true,
        price: 20500000,
        cost_price: 9500000,
        stock_quantity: 6,
        low_stock_threshold: 2,
        weight_grams: 320,
        is_active: true
      }
    ]
  })

  console.log('Seed data created successfully!')
  console.log('Admin email: admin@ybbeautylounge.com')
  console.log('Admin password:', adminPassword)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })