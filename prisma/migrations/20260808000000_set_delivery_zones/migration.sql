-- Replace the old dormant delivery zones with the founder's live locations.
-- Money is kobo (rule 6): ₦3,500 / ₦4,500 / ₦5,000.
-- International has no price yet — the founder sets it in Admin -> Delivery.
DELETE FROM "delivery_zones";

INSERT INTO "delivery_zones" ("id", "name", "states", "fee", "estimated_days", "createdAt") VALUES
  ('zone_lagos_mainland', 'Lagos Mainland', ARRAY['Lagos'], 350000, '1-2', now()),
  ('zone_lagos_island',   'Lagos Island',   ARRAY['Lagos'], 450000, '1-2', now()),
  ('zone_other_states',   'Other states',   ARRAY[]::TEXT[], 500000, '3-5', now()),
  ('zone_international',   'International',   ARRAY[]::TEXT[], 0, '7-14', now());
