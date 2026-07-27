-- Focal point (percentages) controlling how an image sits inside cropped frames
ALTER TABLE "media_assets" ADD COLUMN "focal_x" INTEGER NOT NULL DEFAULT 50;
ALTER TABLE "media_assets" ADD COLUMN "focal_y" INTEGER NOT NULL DEFAULT 50;
