-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "order_id" DROP NOT NULL;
ALTER TABLE "reviews" ALTER COLUMN "customer_id" DROP NOT NULL;
ALTER TABLE "reviews" ADD COLUMN IF NOT EXISTS "invite_token" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_invite_token_key" ON "reviews"("invite_token");
