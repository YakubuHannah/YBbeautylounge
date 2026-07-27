-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_customer_id_fkey";

-- DropForeignKey
ALTER TABLE "reviews" DROP CONSTRAINT "reviews_order_id_fkey";

-- AlterTable
ALTER TABLE "product_images" ADD COLUMN     "alt_text" TEXT,
ADD COLUMN     "display_name" TEXT;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
