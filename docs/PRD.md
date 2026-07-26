# Product Requirements Document — YBBeautylounge

**E-commerce platform (web, mobile-first, PWA) + admin operating system**

| | |
|---|---|
| Version | 4.0 — consolidated, standalone, developer-ready |
| Build type | **New build from scratch.** No existing codebase, prototype, or asset is carried forward |
| Date | 26 July 2026 |
| Owner | Yakubu Boluwatife (Founder) |
| Status | Ready for build, subject to Section 0 |

---

## How to read this document

**Notation.** "§" means "Section". §12 is Section 12.

**This is a from-scratch build.** There is no prior codebase, prototype, or component to inherit, extend, or migrate. Every requirement here is to be built new. Where earlier internal drafts or reference material exist, they are context for understanding the client's intent only and form no part of the deliverable.

**Reading order for a developer.** §3 (what this is), §6 (scope — what is and is not in v1), §12 (the governing principle: what the founder controls versus what requires code), §13 (data model), §14–15 (business logic and payments), §24 (definition of done). Everything else is reference detail for the section you are building.

**Numbers in this document are seeded defaults, not decisions.** Every fee, threshold, reward value, and cap named here is a value the founder edits in admin after launch without a developer. See §12.

**Where a decision is genuinely open**, it is flagged in §25 and marked blocking or deferrable. Everything not flagged there is decided — build it as written.

### The ten things most likely to be got wrong

Stated up front because each is cheap to build correctly now and expensive to retrofit:

1. **Prices are computed server-side.** The client sends variant IDs and quantities only. A request containing a price is rejected (§14.1)
2. **Payment is confirmed by webhook only**, with signature verification, amount assertion, and idempotency (§15.3)
3. **Payment state and fulfilment state are separate machines.** A paid order is not a fulfilled order (§13.3)
4. **A customer record exists from the first order**, keyed on a normalised phone number, with no login required (§13.1)
5. **Stock is reserved at checkout and decremented on confirmed payment**, with an explicit oversell path (§14.4)
6. **Cost price never leaves the server.** Public endpoints serialise named fields only, never whole objects (§19.2)
7. **Attribute lists are admin-managed tables, not code enums** (§13.2)
8. **One image upload yields multiple crops**; nothing is rejected for aspect ratio (§0.1)
9. **Every money-affecting setting is range-validated and audit-logged** (§12.4)
10. **Indexable pages render server-side**, and renaming a product creates a 301 redirect (§18)

---

## Section 0 — Imagery: specification, not a gate

**Correction to earlier drafts of this document:** an earlier version treated photography as a blocking gate on development. That was wrong. Photography is a **launch** dependency, not a **build** dependency. Every part of the system — media library, upload flow, product and variant management, pricing, video, cart, checkout, admin, the full data model — is built and tested against placeholder images and blocks on nothing.

What photography genuinely affects is **layout**. The correct response is not to delay the build, and not to restrict what the founder may upload — it is to build an upload pipeline that accepts any source file and derives every shape the layouts need, paired with layouts tolerant enough to handle the rest. Both are code requirements, specified below.

### 0.1 Upload accepts any source; the system derives every shape

**Governing principle: one master upload, many derived outputs.** The founder uploads whatever file they have — phone, camera, laptop graphic, screenshot, Instagram export — and the system generates every crop the layouts require from that single master. **Images are never rejected for being the wrong shape.**

| Source uploaded | Stored | Derived automatically |
|---|---|---|
| Phone photo (4:3 / 3:4, 3–8MB) | One master at full resolution | 4:5 product card, 1:1 thumbnail, 3:2 hero, 16:9 banner, plus responsive widths |
| Camera / DSLR (3:2, 15–40MB) | One master | Same set |
| Laptop graphic (16:9) | One master | Same set |
| Square export (1:1) | One master | Same set |

#### The cropper — Instagram model, multiple outputs per upload

**One upload produces at least three sizes, not one.** After upload, the cropper presents a tab per output ratio (4:5, 1:1, 16:9, 3:2) and in each tab the founder can **pinch or scroll to zoom and drag to reposition** — the same interaction pattern as Instagram's upload cropper. Each tab saves its own crop from the same master file.

Nothing is mandatory: if the founder skips the cropper entirely, the focal point below produces all outputs automatically. The cropper exists so a hero can be framed differently from a thumbnail when that matters, in a few seconds, without leaving admin.

**No slot is restricted to a single angle or crop.** The founder decides what each output shows.

#### Focal point — the automatic fallback

Each image carries a **focal point**: the founder taps once on the important region (face, hairline, texture) and every un-cropped output keeps that point in frame. Set once per image, not once per output.

**This is not optional polish.** Without a focal point, automatic centre-cropping will eventually cut a model's head off in the hero slot, and the founder will have no way to fix it without a developer — which violates §12.

#### Accepted inputs

| Requirement | Specification |
|---|---|
| Formats | JPEG, PNG, WebP, **HEIC/HEIF**, AVIF |
| **HEIC support** | **Mandatory.** HEIC is the iPhone default. Systems that reject it fail on a large share of real uploads with a confusing error |
| Maximum file size | 50MB, so camera originals are not refused |
| **Client-side downscale before upload** | **Resize in the browser to ~2500px on the long edge before transmitting.** A 30MB camera file becomes ~1MB. On Nigerian mobile data this is the difference between a 4-second upload and a 4-minute upload that fails partway. 2500px exceeds every web slot's requirement |
| Batch upload | Multi-select, with drag-to-reorder |
| Reliability | Upload progress indicator and retry on failure — mobile connections drop |
| Output | Compressed AVIF with WebP fallback, responsive widths, LQIP placeholders |

#### The only legitimate rejection

**Resolution, never aspect ratio.** Reject images under approximately 1200px on the long edge, with a message stating the reason and the minimum — such an image will look soft when a hero slot enlarges it. Every other file is accepted and transformed.

#### Other media library requirements

| Requirement | Behaviour |
|---|---|
| Folders and reuse | Upload once, attach to any product, page, post, or homepage section. Usage indicator shows where an asset appears |
| Alt text | Prompted on upload, auto-suggested from the product name, required for accessibility |
| Required image count | A product cannot move from draft to active with fewer than 3 images. A restoration job cannot reach `closed` without a matched before/after pair (§9.4) |
| Replace in place | Swapping a file updates every location using it |

#### Video

Accept both vertical (phone) and landscape (camera) footage. **The player adapts to the source orientation rather than letterboxing black bars around vertical clips.** Most Restoration Diary footage will be shot vertically on a phone, so vertical is the primary case, not the exception. Support direct upload and YouTube embed (§11.10).

#### The design-side half

Layouts must be **ratio-tolerant**: sized by their container with the image filling it, rather than assuming a single fixed shape. Where a wide crop is genuinely unavailable, the layout falls back to a portrait treatment — never stretches, never letterboxes.

The upload pipeline handles the common case; ratio-tolerant layouts handle the edge case. Both are required. A developer who implements only one of them produces a system that breaks the first time an unusual file is uploaded.

### 0.2 Capture standard (reference only — not part of the build)

**Three sources are used and all are first-class:** phone, camera, and laptop-produced graphics. The upload pipeline in §0.1 treats them identically. Recorded here so the standard exists in writing.

- **Light:** indirect daylight from a window, or outdoor shade. Never direct sun, overhead room lighting, or flash
- **Backdrop:** one plain wall or neutral fabric — the same one every time
- **Stand:** a mannequin head and stand for product shots, so the unit reads as a wig rather than a bundle
- **Consistency over equipment:** same position, same distance, same time of day. Consistency is what reads as professional — not the device
- **Angles per product:** front, back, three-quarter, texture close-up, and one on-model where possible
- **Before/after pairs:** identical position, light, distance, and crop. A mismatched pair reads as a trick and undermines the restoration story. Since closing a restoration job requires both photos (§9.4), this becomes a habit of the work rather than a separate task

### 0.3 What is actually owed before launch

Not before build — before **launch**. The store cannot go live with placeholder imagery, so this is a parallel track with a named owner.

| Asset | Minimum for launch |
|---|---|
| Product images | 3 minimum per product, 4–6 preferred |
| Texture group heroes | 1 per texture group offered |
| Before/after pairs | 3 minimum (accumulates automatically from restoration jobs thereafter) |
| Length reference shots | 1 per stocked length, same model or mannequin — powers `/length-guide` |
| Homepage hero | 1 per featured collection |
| Founder portrait | 1–2 for `/about` |
| Colorway swatches | 1 per colorway, consistent lighting |
| Restoration Diary video | 3 minimum (v1.5, not needed for v1 launch) |

**Owner:** _to be named_ — the founder unless someone else is assigned. **Target date:** _to be set_, before phase 5.

Consent on file for any image featuring a person, and separately for any customer before/after pair used publicly (§9.1).

---

## 1. Purpose of this document

This document is written so a developer or agency with no prior context can build the product end to end without needing to ask the founder basic questions. It covers business context, scope, page-by-page specs, the data model, business logic, integrations, non-functional requirements, and acceptance criteria.

Where a decision is genuinely open, it is flagged in Section 25 and marked as either blocking or deferrable. Everything not flagged there is decided — build it as written. Where this document specifies a number (a fee, a reward value, a threshold), that number is a **default seeded into the database**, changeable by the founder in admin without a code change. See Section 12.

---

## 2. Business context

YBBeautylounge is a Nigerian wig brand selling raw and virgin hair extensions and wigs, and offering a wig revamp and restoration service.

**How sales work today.** A customer sees a Meta (Instagram/Facebook) ad, clicks through to WhatsApp or Messenger, asks questions, negotiates, and pays by manual bank transfer. The founder tracks every sale by hand in a spreadsheet with four fields: hair type, customer name, amount, date. There is no self-serve website. Average order value is approximately ₦185,000.

**Markets.** Nigeria is the primary market. Ghana, the UK, and the US are secondary, currently served through the same manual WhatsApp funnel.

**Current launch.** A new bone-straight collection including a black bob, with brown and burgundy colorways under consideration.

**Brand assets in place.** Invoice branding using a pink/mauve scheme with the wordmark "YBBEAUTYLOUNGE" and the tagline "Wig Revamp & Restoration." A growing personal brand and YouTube channel covering hair, lifestyle reinvention, and mindset growth.

**Business goal.** Grow toward ₦1 billion in revenue within two years.

### An honest note on the revenue target

At ₦185,000 average order value, ₦1 billion is roughly 5,400 orders across two years — an average of about 225 orders a month, which in practice means exiting the period at 400+ per month. Current volume is a fraction of that.

**This website is not a 20x lever.** It is a conversion and efficiency lever: it removes the founder as a bottleneck on every sale, captures customers who already know what they want, and makes the funnel measurable. The 20x has to come from four places, and the product supports each of them:

| Growth source | What this product contributes |
|---|---|
| Paid acquisition at scale | Meta CAPI attribution (§17) so ad spend can be optimised on real data |
| Average order value | Upsells, bundles, free-delivery threshold, care products |
| Repeat purchase | Customer records, store credit, review requests, care reminders, reorder |
| **New channel: wholesale** | Stylist/salon tier with tiered pricing (§10) — repeat, high-volume, low-acquisition-cost |

The restoration service, valuable as it is to the brand story, is capacity-bound to the founder's own hands and cannot scale to the target. Wholesale and digital products can. Treat wholesale as the strategically most important item after v1 ships.

---

## 3. Product summary and the core bet

Build a **mobile-first e-commerce PWA** — installable to the home screen, no download required to shop — plus an **admin panel that replaces the founder's spreadsheet and runs the whole business without developer involvement**.

Three sides to the product:

1. **Customer storefront** — discover, evaluate, and buy wigs; request restoration; read and watch content
2. **Growth layer** — reviews, referrals, discount codes, email capture, waitlists, SEO, retargeting
3. **Admin operating system** — catalog, orders, customers, inventory, content, restoration jobs, settings, analytics

### The core bet, stated plainly

> A Nigerian customer who has never met the founder will pay ₦185,000 through a website, without a WhatsApp conversation first.

That is an assumption, not a fact. It is the single thing v1 exists to test. Consequently:

- **WhatsApp stays on every page.** It is not a bug to be removed; it is currently the closer. The site's job may turn out to be pre-selling and qualifying rather than fully replacing chat.
- **Both paths are instrumented.** Every order records whether it was completed self-serve or preceded by a WhatsApp conversation (see `orders.order_channel`, §13).
- **The metric that decides the strategy** is the percentage of orders completed without a prior WhatsApp message. If that number stays low after launch, the answer is not more features — it is trust infrastructure, payment flexibility, and price presentation.

---

## 4. Goals and success metrics

| Goal | Metric | Baseline | v1 target (90 days post-launch) |
|---|---|---|---|
| Self-serve checkout works at this price point | % orders completed with no prior WhatsApp message | 0% | ≥ 30% |
| Increase order volume | Orders per month | Current spreadsheet count | +40% |
| Reduce founder admin load | Minutes spent per order on reconciliation | Manual, ~10 min | < 2 min |
| Reduce repetitive enquiries | WhatsApp messages per order | Current volume | −40% |
| Grow average order value | AOV, and upsell attach rate | ~₦185,000 | +10% AOV, ≥ 20% attach |
| Build repeat purchase | % customers with 2+ orders | Unknown (unmeasurable today) | Measured, with a baseline established |
| Build trust at scale | Reviews collected; % products with ≥ 3 reviews | 0 | ≥ 50 reviews; ≥ 60% of products |
| Checkout completion | Checkout start → paid conversion | Unknown | ≥ 45% |
| Brand consistency | Qualitative review against invoice/IG identity | — | Pass |

Every metric above must be visible in the admin dashboard (§11.3) without exporting anything.

---

## 5. Users and roles

| Role | Description | Access | Phase |
|---|---|---|---|
| Guest customer | Browses and buys with no account | Storefront, checkout, order tracking by order number + phone | v1 |
| Registered customer | Optional account | Adds order history, saved addresses, wishlist, store credit balance, referral dashboard | v1.5 |
| Wholesale customer | Approved stylist/salon | Tier pricing, bulk order form, credit terms if granted | v2 |
| Admin (founder) | Full control of the business | Entire admin panel | v1 |
| Staff | Team member with limited access | Role-restricted admin | Built for, disabled in v1 |

**On staff roles:** v1 has one admin user. But the permission structure and the audit log are built in v1 and simply not exposed. The moment a team member is added, the founder must be able to see who changed a price. Retrofitting an audit log after the fact is significantly harder than building it now.

---

## 6. Scope and release strategy

The failure mode this section exists to prevent: a founder-funded build attempting twenty routes and seven revenue features, slipping repeatedly, and launching nothing.

### v1 — Launch (the only scope that matters right now)

**Storefront:** home, shop with texture-first browsing and filters, search, product detail with full attributes, length guide, reviews (display and submission), cart, checkout with Paystack, order confirmation, order tracking, restoration service intake, FAQ, about, contact, policies (returns, privacy, terms).

**Commerce:** guest checkout, discount and campaign codes, delivery zones and fees, free-delivery threshold, VAT, payment plan (50/50 deposit), inventory with reservations, email notifications, WhatsApp share and contact.

**Admin:** dashboard with real metrics, products with variants, media library, orders with full operations, customers, inventory, discount codes, reviews moderation, restoration jobs, pages and FAQ, email templates, settings, audit log.

**Foundations:** SEO, Meta Pixel + CAPI, GA4, NDPR consent, error flows, staging environment, backups.

### v1.5 — First 90 days after launch, in priority order

Blog and content management; customer accounts; wishlist; product Q&A; abandoned cart recovery; automated review requests; restock and drop alerts; delivery estimate on PDP; PDF invoices; Restoration Diary video library; waitlist and pre-orders; referral program; bundles; PWA install prompt; care reminder emails; self-pickup; advanced analytics.

### v2 — Once v1 metrics justify it

Wholesale/stylist portal; **AI virtual try-on** (see below); digital products; gift cards; loyalty points; international payments beyond Paystack; tiered affiliate commissions; recently viewed and personalised recommendations.

**On virtual try-on specifically.** Leading international competitors in this category now offer AI face-mapping try-on and position it explicitly as a returns-reduction tool (Appendix B.2). It is moving from differentiator toward table stakes at this price point, which is why it sits in v2 with intent rather than in an indefinite maybe list. It is the single largest build in v2 — scope it properly before committing.

### Explicit non-goals

Native iOS/Android apps. Custom wig builder/configurator. In-house courier integration. Multi-vendor marketplace. Live chat widget — WhatsApp serves this need. Live shopping — a marketing channel competitors use effectively, but it needs no build beyond the discount codes in §11.9.

### The prioritisation rule

Nothing moves from v1.5 to v1. Nothing moves from v2 to v1.5 until the metric it is meant to affect has been measured and found wanting. Features are added in response to data, not enthusiasm.

---

## 7. Information architecture

### Customer-facing

```
/                             Home
/shop                         All products — texture-first, filters, sort, search
/shop/[product-slug]          Product detail
/search                       Search results
/collections/[slug]           Collection landing (admin-created)
/length-guide                 Visual length reference
/reviews                      All reviews (social proof surface, SEO)
/restoration                  Restoration service — info, gallery, intake
/restoration/status/[token]   Customer-visible restoration job status
/track                        Order tracking — order number + phone
/track/[order-number]         Order status timeline
/faq                          Help centre
/about                        Brand story
/contact                      Contact + WhatsApp
/cart                         Cart
/checkout                     Checkout
/order-confirmation/[id]      Order success
/policies/returns             Returns and exchanges
/returns/request              Returns request flow
/policies/privacy             Privacy policy
/policies/terms               Terms of sale
/blog                         Journal                              [v1.5]
/blog/[slug]                  Post                                 [v1.5]
/tutorials                    Restoration Diary video library      [v1.5]
/tutorials/[slug]             Individual tutorial                  [v1.5]
/bundles                      Bundles and kits                     [v1.5]
/waitlist/[collection]        Pre-order / waitlist                  [v1.5]
/referrals                    Referral program                     [v1.5]
/account/*                    Customer account area                [v1.5]
/wholesale                    Stylist/salon programme + application [v2]
```

### Admin

```
/admin/login                  Login
/admin                        Dashboard
/admin/orders                 Order list, detail, operations
/admin/customers              Customer list and detail
/admin/products               Product CRUD, variants, attributes
/admin/inventory              Stock levels, adjustments, low-stock
/admin/collections            Collection CRUD
/admin/media                  Media library with folders
/admin/reviews                Review moderation queue
/admin/returns                Returns queue
/admin/discounts              Discount and campaign codes
/admin/restoration            Restoration job board and quotes
/admin/content/pages          Page editor
/admin/content/faq            FAQ editor
/admin/content/homepage       Homepage section builder
/admin/content/navigation     Menu editor
/admin/emails                 Email template editor and event toggles
/admin/analytics              Reports
/admin/settings               Store settings
/admin/audit                  Audit log
/admin/blog                   Blog CRUD                            [v1.5]
/admin/tutorials              Video library management              [v1.5]
/admin/bundles                Bundle management                     [v1.5]
/admin/waitlist               Waitlist management                   [v1.5]
/admin/referrals              Referral tracking                     [v1.5]
/admin/wholesale              Wholesale accounts and tiers          [v2]
/admin/users                  Staff and permissions                 [built, hidden]
```

**Admin routes are `noindex` and excluded from the sitemap.**

---
## 8. Customer-facing page specifications

Every page: floating WhatsApp button, announcement bar (admin-toggleable), footer with Instagram, YouTube, WhatsApp, policies, and a newsletter signup with an explicit unticked consent box.

### 8.1 Home (`/`)

Homepage sections are **admin-managed and reorderable** (§11.10) — not hardcoded. Default order at launch:

1. Hero — featured collection, full-bleed image, headline, single CTA
2. Featured products — 4 products, admin-selected
3. Shop by texture — the lookbook entry point into `/shop`
4. Trust strip — total customers served, average rating, delivery timeframe, "raw hair guarantee"
5. Reviews — 3 most recent approved reviews with photos, linking to `/reviews`
6. Restoration teaser — one before/after slider, linking to `/restoration`
7. Brand story teaser — linking to `/about`
8. Newsletter capture

The trust strip is not decoration. It is the first-time visitor's only evidence that this is a real business before they consider a ₦185,000 transaction.

### 8.2 Shop (`/shop`)

**Texture-first browsing.** Large cinematic hero cards per texture group (bone straight, curly, wavy, bob) presented lookbook-style, scrolled through before drilling into products. Texture groups are admin-created, not hardcoded.

- **Search bar prominent at the top.** On a mobile storefront, search is frequently the highest-converting entry point and must not be buried behind an icon.
- **Filters below the lookbook cards:** texture, length, colorway, lace type, density, cap size, price range, in-stock only
- **Sort:** newest, price low→high, price high→low, best rated, best selling
- Filter state reflected in the URL so results are shareable and linkable from ads
- Infinite scroll on mobile, pagination fallback for crawlers
- Empty state: "No products match your filters" + clear-filters button + 4 recommended products
- Product cards show: image, name, texture, price, star rating and review count, stock badge if low

### 8.3 Search (`/search`)

Searches product name, description, texture, colorway, and tags. Typo-tolerant. Shows suggestions as the user types. Zero-results state offers popular products and a WhatsApp CTA. **Every search query is logged** — the admin search report (§11.12) is free market research telling the founder what customers want and cannot find.

### 8.4 Product detail (`/shop/[slug]`)

The highest-value screen in the product. Three elements below are the ones most often omitted and most directly tied to conversion: variant-level stock, the delivery estimate, and the instalment framing.

**Gallery:** 4–6 swipeable images, pinch-zoom, video support. The primary gallery shows **the product**. The before/after slider appears as a secondary tab, and only where the product has a genuine restoration pair — a customer buying a new wig wants to see the wig.

**Purchase block:**
- Name, texture, price (with compare-at price struck through when discounted)
- Star rating + review count, anchor-linking to reviews
- Variant selectors: length, colorway (visual swatches), density, cap size
- Per-variant price and stock — selecting a variant updates both
- Stock status: in stock / low stock ("only 2 left") / out of stock with "notify me" (v1.5)
- Quantity
- **Add to cart** (primary CTA, sticky on mobile scroll)
- **Payment plan framing:** show the instalment alongside the total — "or 4 payments of ₦46,250" and "or ₦92,500 today, balance before dispatch" (§14.6). Competitors anchor on the instalment rather than the total, and at least one states that most of its customers use a payment plan
- **Delivery transparency:** processing time and delivery time stated **separately** ("dispatched within 1 business day, then 2–4 days to Lagos"), not merged into a single vague window. This is standard among the premium brands in the comparison set
- Delivery estimate by state (v1.5)
- Secondary CTA: "Ask a question on WhatsApp", pre-filled with the product name

**Below the fold:**
- Full attributes table: texture, length, **density %**, **weight in grams**, **draw type (single / double drawn / SDD)**, lace type and size, cap size, hair origin, grade, pre-plucked, can it be coloured or heat-styled

  Weight in grams and draw type are not optional detail — they are the two attributes Nigerian competitors lead with as quality and value signals (see Appendix B). Omitting them makes the page read as less informed than the market it competes in.
- Description
- Link to `/length-guide`
- Care instructions
- Upsell module: "Complete the look" — care kit, wig cap, adhesive
- Reviews section: rating distribution, photos, sorting, verified-purchase badges
- Product Q&A (v1.5)
- Embedded tutorial if one is linked
- Related products from the same texture group

**Product attributes matter more than they look.** Colorway and length alone are insufficient. Real buyers in this category filter on lace type and size, density, weight, draw type, cap size, and hair origin (§13.2, Appendix B.1). A page missing them looks credible to a developer and amateurish to a customer.

### 8.5 Length guide (`/length-guide`)

Visual reference showing where each stocked length falls on a body, photographed on the same model for comparability, with a plain-language table (inches, where it sits, best for). This answers what is likely a third of current WhatsApp enquiry volume, permanently, at the cost of one shoot and one page.

### 8.6 Reviews (`/reviews`)

All approved reviews across products: rating, title, body, photos, product link, verified-purchase badge, date. Filterable by rating and product. Aggregate rating displayed. Serves as a trust surface for cold ad traffic and an SEO asset.

**Submission:** only via a tokenised link emailed after delivery (§16.4) — this makes every review a verified purchase and makes review fraud structurally impossible. Fields: rating (required), title, body, up to 3 photos, display name. All reviews enter a moderation queue (§11.7).

### 8.7 Cart (`/cart`)

Line items with image, variant, quantity editing, remove, and line total. Subtotal. Free-delivery progress indicator ("Add ₦12,000 more for free delivery") — the simplest AOV lever available. Discount code field. Upsell row. Delivery and VAT shown as "calculated at checkout." Cart persists in local storage for guests and against the customer record once accounts exist. Empty state links back to `/shop` with 4 recommendations.

### 8.8 Checkout (`/checkout`)

Guest checkout by default. Single page, sections revealed in sequence, no forced account creation. Completable in under five steps.

**Fields:** full name, phone (WhatsApp, validated and normalised to E.164), email (required — it carries the receipt), delivery method (delivery / Lagos pickup [v1.5]), address, city, state (dropdown, drives the delivery fee), country (Nigeria / Ghana / UK / US / other), order notes.

**Non-Nigerian countries:** show a clear message routing to WhatsApp for manual arrangement, and do not attempt payment. Paystack is Nigeria-first; international processing is a v2 decision (§25).

**Discount / referral code field** — auto-filled from URL parameter or cookie when the customer arrived via a code.

**Payment selection:** pay in full, or pay 50% deposit (§14.6).

**Order summary:** items, subtotal, delivery fee, discount, VAT, total. All computed server-side.

**Consent:** an unticked checkbox for marketing email with the exact consent wording. Order confirmation email is transactional and sends regardless — it requires no consent. These two must remain architecturally separate (§19.3).

**Payment:** Paystack, with card, bank transfer, USSD, and direct bank all enabled (§15.2).

### 8.9 Order confirmation (`/order-confirmation/[id]`)

Calm, personal thank-you. Order number prominently displayed. Items, total, delivery address, expected timeframe. Next-steps explanation.

Three actions:
1. **"Send my receipt to WhatsApp"** — opens `wa.me` pre-filled with the order number and total. Customer-initiated, so no API and no subscription, and the receipt lands in the app Nigerian customers actually check.
2. **"Track my order"** — links to `/track/[order-number]`
3. Referral share prompt (v1.5)

If the order is a 50% deposit, the balance amount and when it is due are stated explicitly here and in the email.

### 8.10 Order tracking (`/track`)

Order number + phone number, no account required. Shows the status timeline built from `order_events` (§13), items, total, delivery address, courier and tracking number when entered, and a WhatsApp contact button.

This page exists because without it the customer must message the founder to ask where their order is — which defeats the entire purpose of the product. It is v1, not optional.

### 8.11 Restoration service (`/restoration`)

See Section 9 — this is a service product, not a page.

### 8.12 FAQ (`/faq`)

Admin-managed questions grouped by category (ordering, payment, delivery, hair care, restoration, returns), searchable, with `FAQPage` schema markup. Every question answered here is a WhatsApp thread that never happens. Probably the highest return per hour of work in the whole document.

### 8.13 About (`/about`)

Founder's story in first person — corporate-to-founder journey, calm and personal. Brand values. Restoration philosophy. Links to YouTube and Instagram. Admin-editable as a page.

### 8.14 Policies

Returns and exchanges, privacy, terms of sale. Admin-editable pages. Required for data-protection compliance and for basic buyer confidence at this price point. Have the returns and privacy wording reviewed by a Nigerian lawyer before launch (§25).

### 8.15 Returns request flow

A published policy without a mechanism sends every return to WhatsApp. The flow:

- Entry point from `/track/[order-number]` and from the policy page, available while the order is inside the return window
- Fields: order lookup (order number + phone), item selection, reason (wrong item, damaged, not as described, changed mind), up to 3 photos, preferred outcome (exchange or store credit)
- Creates a `ReturnRequest` record and notifies the founder by email
- Customer sees status: requested → approved → awaiting return → received → resolved
- Admin approves or declines with a reason, records the outcome, and issues store credit or processes an exchange
- **Eligibility enforced in code from the delivery date and the configured window**, with restored, custom, and handmade units excluded (§25 q4). Not left to operator memory

```
ReturnRequest
- id, order_id FK, customer_id FK
- items JSON (order_item_id, quantity, reason)
- reason_code, customer_note
- preferred_outcome     exchange | store_credit
- status                requested | approved | declined | awaiting_return |
                        received | resolved | cancelled
- decline_reason, resolution_note
- store_credit_issued   integer kobo, nullable
- photos                via media_assets
- created_at, resolved_at
```

Admin gets a returns queue alongside the order list, and returns volume by reason appears in analytics (§11.12) — a rising "not as described" count is a photography or attribute-accuracy problem, and you want to see it early.

---

## 9. Restoration and revamp service

This is the brand's core differentiator and it is a service business with hard capacity limits — the founder's own hands. It requires a real workflow, not a contact form.

### 9.1 Customer-facing (`/restoration`)

- Service explanation and philosophy
- Before/after gallery drawn automatically from completed jobs where the customer consented to public use
- **Service tiers** with published starting prices (e.g. basic revamp, full restoration, colour correction), so customers self-qualify before enquiring
- Turnaround expectations
- **Intake form:** name, phone, email, wig type/texture, current condition, up to 4 photos, what they want, whether they are in Lagos or shipping in
- Inbound shipping instructions for customers outside Lagos
- Consent checkbox for public use of before/after images — separately from the marketing consent
- Upsell: bundle a future revamp with a purchase at a discount

### 9.2 The job pipeline

Statuses: `enquiry` → `quoted` → `accepted` → `received` → `in_progress` → `ready` → `returned` → `closed`, plus `declined` and `cancelled`.

**Quote flow:** the founder reviews the intake, sets a price and turnaround in admin, and sends a quote. The customer receives an email with a tokenised link showing the quote and an accept button, which takes a deposit through Paystack. Accepting creates an order of type `restoration`, so restoration revenue flows through the same reporting as product revenue.

**Capacity control:** a setting caps the number of jobs in `accepted` + `received` + `in_progress` at once. When the cap is hit, the intake form shows a waitlist message instead of accepting new work. This protects the founder from overcommitting — the most likely way this service damages the brand.

### 9.3 Customer-visible status (`/restoration/status/[token]`)

A tokenised page showing the current stage, expected completion, and any photos the founder has uploaded. No account needed.

### 9.4 The content loop — the strategically important part

**A job cannot be moved to `closed` without a before photo and an after photo attached.**

This is the mechanism that makes the content engine self-sustaining. Treated as a separate task, content production is a manual chore, and manual chores die from neglect. Made a required field of completing paid work, the content library fills itself as a byproduct of the business operating. Those pairs then feed, with one admin action each: the restoration gallery, the homepage teaser, product page before/after tabs, and the Diary.

---

## 10. Wholesale and stylist programme [v2, specified now]

Specified here because it is the highest-leverage revenue stream available and the data model must not preclude it.

- `/wholesale` — programme explanation, tier structure, application form (business name, location, Instagram, volume estimate, ID)
- Admin approval flow; approved accounts get a login
- **Tiered pricing** by volume, set per tier in admin, applied automatically at checkout for logged-in wholesale accounts
- Bulk order form — a table of variants and quantities rather than a one-at-a-time cart
- Minimum order value per tier
- Optional credit terms per account (a flag and a limit, tracked manually in v2)
- Wholesale orders excluded from public reviews and referrals

Why this matters: a stylist who buys four wigs a month at trade price is worth more than twenty one-off retail customers and costs nothing to acquire after the first sale. This is the line item that plausibly moves the revenue target.

---

## 11. Admin panel — the operating system

**Governing principle:** the founder runs the entire business here without a developer. Section 12 defines the boundary precisely.

**Device strategy:** dashboard, order list, order detail, status updates, and the restoration board are **mobile-first** — the founder works from a phone. Product editing, bulk operations, content editing, and analytics are **desktop-optimised but responsive**. Do not force a variant matrix editor onto a 375px screen.

### 11.0 The admin is not reachable by customers

Four independent layers, all mandatory:

1. **Separate routes.** Admin lives under `/admin/*`. No customer-facing page links to it.
2. **Server-side session checks.** Every admin page and every admin API endpoint verifies a valid server-side session before returning any data. Absent a session, the request is redirected — never a rendered page with hidden content, and never a client-side-only check.
3. **Excluded from indexing.** All admin routes are `noindex` and excluded from `sitemap.xml`.
4. **Data separation.** Admin-only fields — `cost_price`, margin figures, internal notes, other customers' personal data, the audit log — are never present in any public API response.

**The real exposure is the API, not the page.** Hiding a route is trivial; data leaks when an endpoint returns a whole database object to the storefront. §19.2 therefore requires **explicit allow-list serialisation** on every public endpoint: named fields only, never a full model. State this to the developer directly — it is the mistake most commonly made.

**Authentication is never client-side.** A password check performed in the browser is readable from page source and provides no protection. Every access decision is made on the server (§11.1).

### 11.1 Authentication

Email and password, password hashed with bcrypt or argon2, server-side session tokens with expiry, rate-limited login, optional 2FA via authenticator app. Password reset by email. **No hardcoded credentials, and no client-side authentication check of any kind.** Credentials live in hashed form in the database; access decisions are made server-side only.

### 11.2 Global admin behaviours

Every list view: search, filter, sort, pagination, CSV export, bulk actions. Every destructive action: confirmation dialog, and soft delete wherever historical data depends on the record. Every money-affecting change: written to the audit log with actor, timestamp, before value, and after value.

### 11.3 Dashboard

Cards: revenue today / this month / all time; orders this month; pending orders; unfulfilled orders; **gross margin this month**; average order value; low-stock item count; new reviews awaiting moderation; open restoration jobs; abandoned checkouts.

Charts: revenue over time (7/30/90/365 days), orders by status, top products by revenue, revenue by texture.

**The bet-tracking card:** self-serve orders versus WhatsApp-assisted orders, as a percentage. This is the number that tells the founder whether the core product bet is working, and it belongs on the front page.

Recent orders table (last 10) with one-tap status updates.

### 11.4 Products

List with search, filter by texture/status/stock, and bulk actions.

Editor: name, slug (auto-generated, editable, **with automatic 301 redirect from the old slug on change**), description (rich text), texture, hair origin, care instructions, images from the media library with drag-to-reorder, before/after pair, featured flag, collections, tags, status (draft / active / archived), publish date, SEO fields (title, meta description, OG image, auto-defaulted).

**Variant matrix editor:** generate variants from the cross-product of length × colorway × density × cap size, then set per variant: SKU, price, compare-at price, **cost price**, stock quantity, low-stock threshold, weight, images, active flag.

Also: duplicate product, soft delete (preserving order history), and a "track inventory" toggle per product — off for restoration and made-to-order items.

### 11.5 Inventory

Stock levels across all variants in one table with inline editing. Low-stock view. **Adjustment log** — every change records the quantity delta, a reason (received, damaged, returned, correction, sold), and the actor. Incoming stock notes with expected dates. Supplier notes per product. Oversell alerts.

### 11.6 Orders

List: order number, date, customer, items summary, total, payment status, fulfillment status, channel (self-serve / WhatsApp-assisted), discount code used. Filters by every one of those. CSV export **with columns matching the founder's existing spreadsheet** — hair type, customer name, amount, date — so the historical record stays continuous.

Detail view: full order, customer with link to their record, payment history and Paystack reference, status timeline from `order_events`, internal notes.

Operations: update fulfillment status; enter courier and tracking number; **mark as paid manually** (a distinct, clearly labelled, logged action for offline transfers — never sharing a code path with the webhook); record a balance payment on a 50/50 order; refund (full or partial, recorded and reflected in payment status); cancel with stock restoration; resend any email; print packing slip; **"Message customer on WhatsApp"** — opens `wa.me` pre-filled from an admin-editable template with the customer's name, item, and order number merged in.

That last button is the pragmatic answer to having no WhatsApp API: manual, but two seconds instead of two minutes, and it preserves the personal touch that is currently closing the brand's sales.

### 11.7 Reviews

Moderation queue: pending / approved / rejected. View rating, text, photos, and the linked verified order. Approve, reject with a reason, or feature. Reply publicly. Aggregate ratings recalculate on approval.

### 11.8 Customers

List: name, phone, email, order count, lifetime value, first and last order date, marketing consent status, tags. Search by name, phone (matching regardless of format), or email. Detail: full order history, restoration history, reviews written, store credit balance, referral activity, notes, tags. CSV export of consented contacts for email campaigns.

Without this the founder cannot identify a repeat customer, and the repeat-purchase metric in §4 is not computable. It is a v1 requirement for that reason, not a convenience.

### 11.9 Discounts and campaigns

Create codes with: code string, type (percent / fixed amount / free delivery), value, minimum order value, usage limit total, usage limit per customer, valid date range, applicable products or collections, first-order-only flag, stacking rules, active toggle.

Per-code reporting: uses, revenue attributed, discount given.

A brand whose acquisition strategy is Meta ads and collection drops needs the ability to run a launch offer and issue a trackable influencer code from day one. Cheap to build, and without it every campaign is unattributable.

### 11.10 Content management

- **Media library with folders.** Upload once, reuse across products, pages, posts, and homepage sections. Folders, search, alt text, replace-in-place, usage indicator showing where an asset appears. This is the founder's stated requirement, made concrete — without it the same wig photo gets uploaded six times.
- **Pages** — create and edit any page from content blocks. A new landing page for a drop is created in admin, not deployed by a developer.
- **Homepage builder** — reorder, enable, disable, and configure homepage sections.
- **Navigation editor** — header and footer menus.
- **FAQ editor** — questions, answers, categories, ordering.
- **Collections** — create, with name, slug, description, hero image, and product assignment. "Burgundy Bob Drop" is a row the founder creates, not a route a developer writes.
- **Announcement bar** — message, link, colour, on/off.
- Blog and tutorials (v1.5) follow the same pattern.

### 11.11 Email templates

Every transactional email editable in admin: subject, body with merge tags (`{{customer_name}}`, `{{order_number}}`, `{{total}}`, `{{tracking_url}}`), and an on/off toggle per event. Send-test-to-me button. Preview.

The founder must be able to change the wording of an order confirmation without a developer. That is the whole point of the tier boundary in Section 12.

### 11.12 Analytics

Revenue by product, variant, texture, collection, and month. **Gross margin** by product and month (this is why cost price exists in the data model). AOV over time. Funnel: product view → add to cart → checkout start → paid, with drop-off percentages. Traffic source attribution. **Search query report** with zero-result queries highlighted — free market research. Discount code performance. Review volume and average rating over time. Repeat purchase rate. Self-serve versus WhatsApp-assisted split.

### 11.13 Settings

Store name, logo, contact details, WhatsApp number. Delivery zones and fees. Free-delivery threshold. VAT rate and whether prices are VAT-inclusive. Payment channels enabled. Payment plan on/off, deposit percentage, balance due rule. Referral reward values and guard rails. Restoration capacity cap. Currency and formatting. Social links. SEO defaults. Store open/closed with a message. Feature flags for phased rollout.

**Every setting is range-validated and audit-logged** (§12.4).

### 11.14 Audit log

Actor, action, entity, before value, after value, timestamp, IP. Filterable. Read-only, and not deletable from the UI.

---

## 12. The admin-versus-code boundary

The founder's requirement: manage the product without touching code; code changes only for technical work or capacity expansion. That requirement is right, and it becomes buildable once one distinction is made — **configuration is not code**.

### 12.0 Build versus use — read this first

Every feature in this document has two separate lives, and conflating them causes most misreadings of the tier table below.

| | Who makes it exist | Who operates it |
|---|---|---|
| Upload button, cropper, ratio enforcement | Developer — once, at build | Founder — every image, forever |
| Price, cost, stock fields | Developer — once | Founder — whenever they change |
| Video embed field | Developer — once | Founder — every video |
| Discount code creator | Developer — once | Founder — every campaign |
| Email template editor | Developer — once | Founder — whenever wording changes |

When this document says something "requires code," it means **bringing the capability into existence** — a one-time cost at build. It does not mean the founder needs a developer to use it afterwards.

**After launch, a developer is needed only for:** a genuinely new *kind* of capability that does not exist yet (e.g. subscriptions, a booking calendar), a new third-party integration, bug fixes, and scaling. Nothing else.

**Never needed after launch:** products, variants, prices, cost, stock, images, videos, collections, discount codes, pages, blog posts, FAQ, policies, email wording, delivery fees, VAT rate, homepage layout, navigation, reviews, restoration jobs, settings.

### 12.1 Four tiers

| Tier | Changed by | Mechanism | Examples |
|---|---|---|---|
| **1. Admin UI** | Founder, anytime | Database | Products, prices, stock, cost, collections, discount codes, delivery zones and fees, free-delivery threshold, VAT rate, payment channels, deposit percentage, referral values, restoration capacity, email templates and toggles, homepage layout, navigation, pages, FAQ, policies, blog, reviews, announcement bar, SEO fields, feature flags |
| **2. Hosting config** | Founder, no developer, no code deploy | Vercel dashboard environment variables | API keys and secrets — Paystack, Brevo, Meta, database URL |
| **3. Code** | Developer | Deployment | Business *logic*: how VAT is calculated, how stock decrements, how credit is awarded, how the checkout flow sequences, new page types, new integrations |
| **4. Never configurable** | Nobody | — | Payment signature verification, server-side price recomputation, order-total assertion, password hashing, consent recording |

### 12.2 The rule that generates tier 1

> If the founder would plausibly change it more than once a year, it belongs in admin. If changing it wrongly loses money or leaks data, the *logic* belongs in code.

**Rates and values are data. Rules are code.** The VAT rate lives in admin; the VAT calculation lives in code. The referral reward amount lives in admin; the eligibility check lives in code. This split is what lets the founder operate independently without being able to accidentally break the business.

### 12.3 Why tier 4 exists

If admin can disable webhook signature verification to unstick a stuck order, that toggle is how the store eventually gets robbed. Build the legitimate escape hatch instead — the logged manual "mark as paid" action in §11.6 — and leave the verification itself untouchable.

### 12.4 Two requirements on every tier-1 setting

1. **Validation.** A delivery fee field that accepts a negative number, or a VAT field that accepts 750, will eventually be filled in wrongly at 1am. Enforce type, range, and required-ness at the API layer, not just in the form.
2. **Audit trail.** Every change to a money-affecting setting is logged with actor, timestamp, and before/after values.

### 12.5 Schema requirements this implies

- A `settings` table (key, value as JSON, type, validation rule) rather than values in a config file
- A `notification_templates` table with merge-tag support
- Content stored as data — `pages`, `page_blocks`, `faqs`, `homepage_sections`, `navigation_items`
- A `media_assets` table with folders and usage tracking
- A `feature_flags` table, so phases ship without code branching

---
## 13. Data model

Every table: `id` (UUID), `created_at`, `updated_at`. Soft delete (`deleted_at`) where historical records depend on the row.

### 13.1 Customer

```
Customer
- id
- phone_normalised        UNIQUE, E.164 (+2348031234567) — the identity key
- phone_raw               as entered, for display
- name
- email                   nullable, indexed
- marketing_consent       boolean, default false
- consent_recorded_at
- store_credit_balance    integer, kobo, default 0
- order_count             denormalised, maintained on order paid
- lifetime_value          denormalised, kobo
- first_order_at, last_order_at
- tags                    array
- notes                   admin-only
- is_wholesale            boolean, default false      [v2]
- wholesale_tier_id       nullable FK                  [v2]
- password_hash           nullable — set only if they create an account [v1.5]
```

**The critical implementation detail:** normalise the phone number **before** matching. `0803...`, `+234803...`, `234803...`, and `0803 123 4567` must all resolve to the same customer, or deduplication is decorative and every metric built on it is wrong. Normalise on write, store both forms, index the normalised one.

Customers are created silently by upsert at checkout. No login, no friction, no visible account. This one table is what makes repeat-purchase rate, lifetime value, referral attribution, and store credit possible — and it removes a painful migration when accounts arrive in v1.5.

### 13.2 Product and variants

```
Product
- id, name, slug (unique), description
- texture                 FK or enum: bone_straight | curly | wavy | bob | ...
- hair_origin             e.g. Brazilian, Peruvian, Indian
- care_instructions
- status                  draft | active | archived
- featured                boolean
- track_inventory         boolean, default true
- before_image_id, after_image_id    nullable FK to media_assets
- seo_title, seo_description, seo_image_id
- avg_rating              denormalised, recalculated on review approval
- review_count            denormalised
- published_at, deleted_at

ProductVariant
- id, product_id FK
- sku                     unique
- length_inches           nullable integer
- colorway                nullable
- density_percent         nullable — 130 | 150 | 180 | 200 | 250 | 300
- draw_type               nullable — single | double_drawn | super_double_drawn (SDD)
- lace_type               nullable — hd | transparent_swiss | standard | none
- lace_size               nullable — 13x6 | 13x4 | 5x5 | 4x4 | 2x6 | 2x4 | full_lace
- cap_size                nullable — small | medium | large (label), with inch range shown
- hair_grade              nullable — 7a | 10a | ...
- is_pre_plucked          boolean
- can_be_coloured         boolean
- price                   integer, kobo
- compare_at_price        nullable, kobo
- cost_price              integer, kobo — ADMIN ONLY, never serialised to any public endpoint
- stock_quantity          integer
- low_stock_threshold     integer, default 2
- weight_grams            nullable
- is_active               boolean

ProductImage        product_id FK, variant_id nullable FK, media_asset_id FK, sort_order
ProductTag          product_id FK, tag
Collection          id, name, slug, description, hero_image_id, sort_order, is_active, seo fields
CollectionProduct   collection_id FK, product_id FK, sort_order
```

**Every attribute list above is an admin-managed lookup table, not a code enum.** Textures, densities, lace sizes, cap sizes, origins, and grades are rows the founder adds. This category's vocabulary shifts constantly — new lace sizes and new quality signals appear every season — and a hardcoded enum means paying for a deployment each time. This is the concrete form of the founder's "admin must handle it without code" requirement at the attribute level.

**Cost price sits on the variant, not the product** — cost varies by length and colour. It must never appear in a customer-facing API response; over-broad serialisers are the usual way this leaks.

### 13.3 Order

```
Order
- id
- order_number            human-readable, sequential-ish: YBB-2026-0142
- customer_id             FK
- customer_name_snapshot, customer_phone_snapshot, customer_email_snapshot
- delivery_address, city, state, country, delivery_notes
- delivery_method         delivery | pickup
- order_type              product | restoration | wholesale
- order_channel           self_serve | whatsapp_assisted | admin_created
- subtotal, delivery_fee, discount_amount, vat_amount, total    all integer kobo
- amount_paid             integer kobo
- discount_code_id        nullable FK
- referral_code_id        nullable FK
- payment_status          pending | partially_paid | paid | failed | refunded | partially_refunded
- fulfillment_status      unfulfilled | processing | ready | shipped | delivered | returned | cancelled
- payment_plan            full | deposit_50
- balance_due_amount, balance_due_at    nullable
- courier_name, tracking_number         nullable
- internal_notes
- paystack_reference      unique, nullable
```

**Two independent state machines.** `paid` must never appear inside `fulfillment_status` — that leaks payment state into fulfilment state. A paid order is not a fulfilled order, and conflating them makes it impossible to answer "what have I been paid for but not yet shipped?" — which is the founder's most frequent daily question.

Snapshots exist so that editing a customer record never rewrites order history.

```
OrderItem
- id, order_id FK, product_variant_id FK (nullable — variant may be archived)
- product_name_snapshot, variant_description_snapshot
- quantity, unit_price, unit_cost, line_total       kobo

OrderEvent
- id, order_id FK
- event_type              created | payment_initiated | paid | balance_paid | status_changed |
                          note_added | email_sent | refunded | cancelled
- from_value, to_value, description
- actor_type              system | admin | customer
- actor_id                nullable
- is_customer_visible     boolean
- created_at
```

`OrderEvent` is the single highest-value table in this model. One table gives you the admin audit trail, the customer-facing tracking timeline on `/track`, and the debugging record for every payment dispute. `unit_cost` snapshotted on the item is what stops historical margin from silently rewriting itself when a supplier price changes.

### 13.4 Payments, stock, and discounts

```
Payment
- id, order_id FK
- amount, kobo
- type                    full | deposit | balance | refund
- method                  paystack | manual_transfer | cash
- paystack_reference, paystack_channel    nullable
- status                  pending | success | failed
- verified_at
- recorded_by_admin_id    nullable — set for manual entries
- raw_webhook_payload     JSON, for dispute resolution

StockReservation
- id, product_variant_id FK, quantity
- order_id FK, expires_at, released_at

StockAdjustment
- id, product_variant_id FK, quantity_delta
- reason                  received | damaged | returned | correction | sold | manual
- note, actor_id

DiscountCode
- id, code (unique, case-insensitive)
- type                    percent | fixed_amount | free_delivery
- value
- minimum_order_value
- usage_limit_total, usage_limit_per_customer, times_used
- valid_from, valid_until
- first_order_only        boolean
- allows_stacking         boolean
- applicable_scope        all | products | collections
- is_active

DiscountRedemption        discount_code_id FK, order_id FK, customer_id FK
```

### 13.5 Reviews, referrals, credit

```
Review
- id, product_id FK, order_id FK (required — guarantees verified purchase)
- customer_id FK
- rating                  1-5
- title, body
- display_name
- status                  pending | approved | rejected
- rejection_reason, admin_reply
- is_featured
- ReviewImage: review_id FK, media_asset_id FK

ReferralCode
- id, customer_id FK      (not "customer_id or contact_info" — the Customer table removes the ambiguity)
- code                    unique
- times_used, total_reward_earned
- is_active

ReferralRedemption
- id, referral_code_id FK, order_id FK, referred_customer_id FK
- referee_discount_amount, referrer_reward_amount
- status                  pending | released | cancelled
- released_at

StoreCreditTransaction
- id, customer_id FK
- amount                  kobo, signed
- type                    referral_reward | refund | manual_grant | redemption | expiry
- order_id                nullable FK
- balance_after
- note, actor_id
```

Store credit as a **ledger of transactions**, not a mutable balance field. The balance is derived and cached; the ledger is the truth. This is the difference between being able to answer "why does this customer have ₦10,000?" and not.

### 13.6 Restoration

```
RestorationJob
- id, job_number, customer_id FK
- wig_type, current_condition, customer_request
- is_lagos                boolean
- status                  enquiry | quoted | accepted | received | in_progress |
                          ready | returned | closed | declined | cancelled
- service_tier_id         nullable FK
- quoted_amount, quoted_turnaround_days
- quote_sent_at, quote_accepted_at
- deposit_order_id        nullable FK to Order
- before_image_id, after_image_id     nullable — BOTH REQUIRED to reach status 'closed'
- public_use_consent      boolean
- is_published_to_gallery boolean
- status_token            unique — powers /restoration/status/[token]
- internal_notes

RestorationIntakeImage    job_id FK, media_asset_id FK
RestorationServiceTier    id, name, description, starting_price, typical_turnaround_days, is_active
```

### 13.7 Content, config, compliance

```
MediaAsset
- id, folder_id nullable FK, filename, url, thumbnail_url
- mime_type, file_size, width, height, alt_text
- uploaded_by_admin_id
MediaFolder               id, name, parent_folder_id nullable

Page                      id, slug, title, status, seo fields, published_at
PageBlock                 page_id FK, block_type, content JSON, sort_order
HomepageSection           section_type, config JSON, sort_order, is_active
NavigationItem            menu (header|footer), label, url, sort_order, parent_id
Faq                       question, answer, category, sort_order, is_active
BlogPost                  id, slug, title, excerpt, body, cover_image_id,
                          author, status, published_at, seo fields, linked_product_ids   [v1.5]

Setting                   key (unique), value JSON, value_type, validation_rule, updated_by
NotificationTemplate      event_key (unique), subject, body_html, body_text,
                          is_enabled, available_merge_tags
FeatureFlag               key, is_enabled, description
Redirect                  from_path, to_path, status_code (301) — auto-created on slug change

AdminUser                 id, email, password_hash, name, role, is_active, last_login_at
AuditLog                  actor_id, actor_type, action, entity_type, entity_id,
                          before_value JSON, after_value JSON, ip_address, created_at
ConsentRecord             customer_id FK nullable, email, phone, consent_type,
                          consent_text_shown, granted boolean, ip_address, user_agent, created_at

SearchQueryLog            query, result_count, customer_id nullable, created_at
AbandonedCheckout         id, customer_id nullable, email, phone, cart_contents JSON,
                          subtotal, recovered_order_id nullable, created_at   [v1.5]
WaitlistSignup            collection_name, customer_id FK, deposit_paid,
                          deposit_order_id nullable                            [v1.5]
```

**All money is stored as integers in kobo.** Never floats. Floating-point arithmetic on currency produces rounding errors that surface as reconciliation failures nobody can explain.

---

## 14. Business logic (tier 3 — code, not configurable)

### 14.1 Price computation

The cart sends **variant IDs and quantities only — never prices**. The server:

1. Loads current variant prices from the database
2. Computes `subtotal`
3. Resolves the delivery fee from the state and the delivery zone table; applies the free-delivery threshold
4. Validates and applies the discount or referral code
5. Computes VAT per the configured rate and inclusivity setting
6. Computes `total`
7. Persists the order with all components as `pending`

A client that sends a price is rejected. This is the single most common e-commerce vulnerability and it must be closed by construction, not by validation.

### 14.2 VAT

Rate stored in settings (default 7.5%). A setting controls whether displayed prices are VAT-inclusive or exclusive. The **calculation** is code; the **rate and the flag** are admin-editable. VAT is shown as a separate line on the order summary, the confirmation, and the receipt.

### 14.3 Delivery fees

A `delivery_zones` table: zone name, matching states, fee, estimated days. Defaults at launch: Lagos, South-West, other Nigeria, international-manual. The free-delivery threshold is a setting; when the subtotal meets it, the fee is zero.

### 14.4 Inventory

- **Decrement on payment confirmed, not on add-to-cart.**
- **Soft reservation at checkout initialisation:** a `StockReservation` row with a 15-minute expiry tied to the payment reference. Available stock = `stock_quantity` − active reservations. A scheduled job releases expired reservations. This matters because the products are near-unique — two customers reaching checkout for the last unit is a real, frequent scenario, not an edge case.
- **The decrement runs inside a transaction conditional on `stock_quantity >= quantity`.** If it fails, the order is flagged, the founder is emailed immediately, and the customer sees a clear message with a refund path. Oversell will happen eventually; build the path now rather than discovering it live.
- Products with `track_inventory = false` skip all of the above.

### 14.5 Referrals

**Defaults, all admin-editable:**

| Parameter | Default |
|---|---|
| Referee (friend) discount | ₦5,000 off a first order |
| Minimum order for referee discount | ₦50,000 |
| Referrer reward | ₦10,000 **store credit** |
| Reward release | On order paid **and** return window closed |
| Monthly cap per referrer | 5 rewards |

**Guard rails (code):** no self-referral, matched on normalised phone *and* email; first orders only; one code per order; no stacking with campaign codes unless `allows_stacking` is set; cap enforced server-side.

Store credit rather than cash is deliberate — it costs less, it drives the second purchase, and it spares the founder a payout process. Fixed naira rather than a percentage is also deliberate: at ₦185,000 AOV a 10% referral discount gives away ₦18,500 per order plus the referrer's reward, and the exposure scales with your most expensive product. A fixed amount caps it.

Releasing at payment rather than after the return window means paying out rewards on orders that later get refunded.

### 14.6 Payment plans — instalments

**Benchmark:** paying in four interest-free instalments over six weeks is the near-universal standard among the international premium brands this business competes with (Appendix B.2). Klarna, Afterpay, Zip and Sezzle do not operate in Nigeria, so the mechanism is built in-house.

**The critical difference:** Klarna underwrites its own credit risk. Building it yourself means the business would carry that risk — unless dispatch is withheld until the final payment clears. It is.

**Two plans, both admin-configurable and independently toggleable:**

| Plan | Structure | Dispatch |
|---|---|---|
| `deposit_50` | 50% now, balance before dispatch | On balance cleared |
| `instalment_4` | 4 equal payments over 6 weeks — first at checkout, then fortnightly | On final payment cleared |

**Mechanics (both plans):**

- Order created with `payment_status: partially_paid`, `fulfillment_status: processing`
- Stock decremented on the first payment — the unit is committed to that customer
- An `instalment_schedule` records each due amount and date; a tokenised payment link is emailed before each due date, requiring no account
- Reminder emails at a configurable interval before each instalment
- **Dispatch is blocked in code while `payment_status = partially_paid`** — not by operator discipline
- Admin can record any instalment manually for offline transfers
- Missed-payment policy configurable in settings: grace period, then cancellation with stock restored and a configurable retention or refund of amounts paid. Have the retention term reviewed legally (§25)

**Price framing on the product page.** Display the instalment alongside the total — "or 4 payments of ₦46,250" — because competitors anchor on the monthly figure and at least one states outright that most of its customers use a payment plan. This is a display change with real conversion impact and near-zero cost.

At ₦185,000 in the Nigerian market, this is plausibly the highest-conversion feature in the document.

### 14.7 Order number generation

Format `YBB-YYYY-NNNN`, sequential per year, generated server-side, never guessable by increment for security-sensitive lookups — `/track` requires order number **plus** matching phone.

---

## 15. Payments — Paystack integration

### 15.1 The flow

1. Client posts variant IDs and quantities to `POST /api/orders`
2. Server computes all amounts (§14.1), creates the order as `pending`, generates a unique reference, creates stock reservations
3. Server calls Paystack initialise with the amount **in kobo** and the reference
4. Client opens Paystack (inline or redirect)
5. **Payment is confirmed by webhook only.** The client redirect updates the UI optimistically but never the payment status.

### 15.2 Channels

Pass `channels: ['card', 'bank_transfer', 'ussd', 'bank']` explicitly. The enabled list is an admin setting so a misbehaving channel can be switched off without a deploy.

Bank transfer generates a one-time virtual account, which is the best available experience for customers who will not use a card — a meaningful share of the Nigerian market, and card failure rates make this more than a nicety.

### 15.3 Webhook handling (tier 4 — never configurable)

1. **Verify the HMAC SHA512 signature** of the raw request body against the Paystack secret key, using the `x-paystack-signature` header. Compute against the raw body — parsing first and re-serialising changes the bytes and breaks the comparison.
2. Confirm `event === 'charge.success'`
3. Find the order by reference
4. **Assert the paid amount equals the stored order total in kobo.** Unit mismatch — naira versus kobo — is the classic bug in Nigerian Paystack integrations, and it fails silently in the direction of accepting underpayment.
5. Mark paid inside a transaction keyed on the reference, so retries are no-ops. Paystack retries; the handler must be idempotent.
6. Decrement stock, release reservations, write an `OrderEvent`, upsert the customer, credit any referral, send the confirmation email, fire the Meta CAPI Purchase event
7. Return 200 quickly; do slow work asynchronously

Store the raw webhook payload for dispute resolution.

### 15.4 Reconciliation

A scheduled job (every 15 minutes) queries Paystack for orders still `pending` past a threshold and reconciles them. **Webhooks do get missed** — network failures, deploys, cold starts — and without this job those orders sit unpaid in the database while the customer's money has left their account. This is the difference between a support ticket and a lost customer.

### 15.5 Timeouts and failures

Pending orders auto-expire after a configurable window (default 60 minutes), releasing reservations. Failed payments keep the order recoverable with a retry link. Every payment attempt is recorded in `Payment`.

### 15.6 The manual escape hatch

Admin can mark an order paid for offline bank transfers. It is a **separate, clearly labelled action**, requires a note, records the acting admin, and writes to both `OrderEvent` and `AuditLog`. It never shares a code path with the webhook.

### 15.7 Sequencing — test mode first, live account in parallel

A functional product comes first; the Paystack *paperwork* does not have to block it. But the distinction matters:

| Deferrable | Not deferrable |
|---|---|
| Paystack business verification, CAC documents, settlement bank account, live keys | Server-side price computation, order state machine, webhook verification, idempotency, stock reservations |

The second column is not a payment feature bolted on later — it is the shape of the order system. Retrofitting it means rewriting checkout, orders, and inventory.

**The approach:** build the complete integration against **Paystack test mode from day one**. Test keys are free and available instantly with no business verification, and behave identically to live. The developer builds and tests real webhooks, real signature verification, and real failure paths, while live-account approval proceeds in parallel. Going live is then swapping two environment variables in the hosting dashboard — tier 2 in §12, no code change, no developer involvement.

**What must not happen:** building checkout with a simulated "mark as paid" action intended to be wired up to a real processor later. That pattern skips the order state machine, the amount assertion, and the idempotency handling — and produces exactly the rewrite this sequencing exists to avoid. Test mode exercises all three; a fake button exercises none.

### 15.8 Fees

Paystack's local transaction fee is capped, so a ₦185,000 order costs approximately the cap rather than a percentage — processing fees barely touch the margin at this price point. Confirm current published rates before launch, and record the fee per transaction if margin reporting needs it.

---

## 16. Notifications

**Decision: email is the automated channel. SMS is excluded** — it requires an additional subscription and the value does not justify it. WhatsApp is reached through customer-initiated links, which needs no API and no approval.

### 16.1 The gap this creates, and how it is closed

Nigerian customers check WhatsApp far more reliably than email. If email is the only automated channel, some confirmations go unread and those customers message the founder anyway — the exact outcome the product exists to prevent. Three mechanisms close it:

1. **"Send my receipt to WhatsApp"** on the confirmation page — `wa.me` pre-filled with the order number and total. Customer-initiated, so no API, no cost, and the record lands in the app they actually use.
2. **"Message customer" in admin** on every order — `wa.me` pre-filled from an admin-editable template. Manual, but two seconds instead of two minutes, and it preserves the personal touch that currently closes the brand's sales.
3. **Email carries the durable record** — confirmation, status changes, receipt, review request.

### 16.2 Provider

**Brevo is a reasonable start**: transactional and marketing in one account with one bill, which matters when one person operates everything. The risk is that marketing volume damages the sending reputation of the domain that also sends order confirmations. Two acceptable paths: accept that risk now and split later, or split immediately — Resend or Postmark for transactional, Brevo for marketing.

**Either way, build behind a `NotificationService` interface** so switching providers is one implementation file, not a refactor. Keys live in tier 2 (hosting environment variables), not in code.

### 16.3 Deliverability — the part that actually determines whether this works

SPF, DKIM, and DMARC configured on `ybbeautylounge.com`. Send from `orders@ybbeautylounge.com`, never from a Gmail address. Warm the domain gradually. Monitor bounce and complaint rates.

Skip this and confirmations land in spam and the entire channel is theatre. This is a launch blocker, not a nice-to-have.

### 16.4 Events

| Event | Trigger | Consent needed |
|---|---|---|
| Order confirmation | Payment confirmed | No — transactional |
| Deposit received + balance due | Deposit paid | No |
| Balance reminder | 48h before due | No |
| Order shipped | Status → shipped | No |
| Order delivered | Status → delivered | No |
| Review request | 7 days after delivered, tokenised link | No |
| Restoration quote | Quote sent | No |
| Restoration status change | Status change | No |
| Refund processed | Refund recorded | No |
| Low stock alert (to founder) | Stock ≤ threshold | — |
| Oversell alert (to founder) | Decrement failure | — |
| New order alert (to founder) | Payment confirmed | — |
| Abandoned cart (v1.5) | 4h after abandonment | Yes |
| Care reminder (v1.5) | 21 days after delivery | Yes |
| Campaign / new drop | Manual | Yes |

Every template editable in admin (§11.11), every event individually toggleable. Transactional and marketing must be architecturally separate — the consent requirement differs and conflating them is an NDPR problem.

---

## 17. Analytics and attribution

### 17.1 Meta Pixel + Conversions API

Both. Browser Pixel for `ViewContent`, `AddToCart`, `InitiateCheckout`, `Purchase`, and server-side CAPI for the same events, **each pair sharing an `event_id`** so Meta deduplicates rather than double-counting.

Fire the server-side `Purchase` from the **webhook**, not the client redirect. Pass hashed phone for advanced matching — this is where CAPI earns its place here, since phone is always captured and email sometimes is not.

Post-ATT, browser-side Pixel under-attributes substantially, and the brand's entire acquisition engine is Meta ads. This is the cheapest revenue-affecting addition in the document.

### 17.2 GA4

Alongside Meta, not instead of it. It is free, and Meta's own numbers should not be the sole source of truth on how Meta is performing.

### 17.3 First-party events

Recorded in the database, not only in third-party tools: product views, searches (with zero-result flagging), add-to-cart, checkout start, order channel, discount usage, referral attribution. These power the admin analytics in §11.12 and survive any ad-blocker or platform change.

### 17.4 Attribution

Capture UTM parameters and referral codes on first visit into a first-party cookie, persist them onto the order. Report revenue by source in admin.

---

## 18. SEO and performance

### 18.1 Rendering

**Next.js** with static generation or ISR for home, shop, products, collections, blog, and pages. Client-rendered only for cart, checkout, account, and admin — all of which are `noindex`. A fully client-rendered PWA can rank at zero, which for a brand with organic ambitions is throwing away the only acquisition channel that does not require ad spend.

### 18.2 On-page

Admin-editable title, meta description, and OG image per product, collection, page, and post, with sensible auto-generated defaults so it works even if the founder never touches it. Canonical URLs. Auto-generated `sitemap.xml` and `robots.txt`.

**Structured data:** `Product` with price, availability, and `AggregateRating`; `BreadcrumbList`; `FAQPage`; `Article` on blog posts; `Organization` on home. Review stars in search results are a measurable click-through lift — one more reason reviews belong in v1 rather than later.

### 18.3 The slug trap

**Renaming a product must automatically create a 301 redirect from the old slug** (`Redirect` table, §13.7). Without it, every rename silently discards whatever ranking that page had accumulated. The admin UI should mention this so the founder understands what is happening.

### 18.4 Performance budget

Sub-2-second product image loads on Nigerian mobile connections is the target. It needs concrete constraints rather than an aspiration:

| Constraint | Target |
|---|---|
| Hero image | ≤ 150KB, AVIF with WebP fallback |
| Product images | Responsive `srcset`, lazy-loaded below the fold, LQIP placeholders |
| Largest Contentful Paint | < 2.5s on 4G |
| Total JS on first load | < 200KB gzipped |
| Fonts | Self-hosted, subset, one weight preloaded |
| Lighthouse mobile performance | ≥ 85 |

**Fonts specifically:** two Google Font families across many weights, loaded from a third-party origin, will fight this budget. Self-host, subset to Latin, and preload only the weight used above the fold.

---

## 19. Security and compliance

### 19.1 Baseline

No plaintext passwords anywhere. Hashed admin passwords (bcrypt/argon2), server-side sessions with expiry, rate-limited login. HTTPS enforced. Rate limiting on every public form — checkout, restoration intake, newsletter, search — to prevent abuse. Input validation server-side on every endpoint. Parameterised queries. CSRF protection. Security headers and a Content Security Policy. Secrets in environment variables, never committed. Signed, time-limited tokens for `/track`, review submission, restoration status, balance payment, and unsubscribe.

**No client-side authentication anywhere.** Hiding a page in the browser is not access control.

### 19.2 Data protection

Cost prices, internal notes, customer PII, and audit logs are never exposed on public endpoints. Serialise explicitly by allow-list rather than passing whole model objects. Encrypt backups. Restrict database access.

### 19.3 Data protection — NDPA 2023 and GAID 2025

**The operative framework.** The Nigeria Data Protection Act 2023 is operationalised by the General Application and Implementation Directive (GAID) 2025, issued 20 March 2025 and effective 19 September 2025. Both apply to this business.

**Registration is likely required, and it is inexpensive.** A controller is "of major importance" (DCPMI) if it processes personal data of more than 200 data subjects in six months — a threshold this business will cross early. GAID sorts DCPMIs into Ultra-High (UHL), Extra-High (EHL), and Ordinary-High (OHL) levels; OHL covers small businesses. Indicative registration fees at the time of writing: UHL ₦250,000, EHL ₦100,000, OHL ₦10,000. OHL entities renew annually and are **not** required to file annual Compliance Audit Returns. Action: confirm classification and register — the fee is trivial relative to the penalty exposure.

**Consent rules that dictate the checkout UI.** Consent must be explicit, freely given, specific, informed, and unambiguous, evidenced by affirmative action. Dark patterns and forced consent are prohibited. This is why the marketing checkbox is unticked, separate from order placement, and never a condition of purchase.

**Breach procedure — build it before launch, not after the first incident.** Controllers must notify the Commission within 72 hours of becoming aware of a breach, stating the nature of the incident, the categories and approximate number of affected data subjects, and the mitigation steps taken. Requirements this places on the build: the ability to count affected customers quickly (the `Customer` and `ConsentRecord` tables provide this), a documented written procedure, and a named person responsible.

**Penalty exposure.** Up to ₦10 million or 2% of annual gross revenue for controllers of major importance, and up to ₦2 million or 2% for others, whichever is higher.

**Two further points.** GAID's reach extends to entities outside Nigeria that target Nigerian data subjects — so any overseas fulfilment, marketing, or analytics partner is in scope and needs a data processing agreement. And a Data Protection Officer must be designated by controllers of major importance; registration requires the DPO to provide a Nigerian National Identification Number, so this must be a Nigerian citizen or resident.

### 19.3.1 Implementation checklist

- Privacy policy, terms of sale, and returns policy as admin-editable pages, live before launch
- **An unticked marketing consent checkbox** at checkout and on every signup form, with the exact wording shown
- Every consent written to `ConsentRecord` with the wording displayed, timestamp, IP, and user agent — **consent you cannot produce is consent you do not have**
- Transactional email (service delivery, no consent required) architecturally separate from marketing email (consent required)
- One-click unsubscribe in every marketing send, honoured immediately
- A data access and deletion request path, with deletion anonymising rather than destroying order records (financial records must be retained)
- A retention policy for dormant records

**Have a Nigerian lawyer review the privacy policy, terms, and returns wording before launch.** Obligations around registration and data protection officers depend on thresholds the business may cross as it grows, and this document should not be treated as legal advice.

---

## 20. Technical architecture and non-functional requirements

### 20.1 Recommended stack

| Layer | Recommendation | Why |
|---|---|---|
| Framework | Next.js (App Router), TypeScript | SSR/ISR for SEO, one codebase for storefront and admin |
| Database | PostgreSQL (Supabase or Neon) | Relational integrity matters for orders and money |
| ORM | Prisma or Drizzle | Migrations as code |
| Media | Cloudinary or Supabase Storage + CDN | On-the-fly resizing and format conversion |
| Hosting | Vercel | Env-var config in tier 2; preview deploys |
| Payments | Paystack | NGN-native |
| Email | Brevo (± Resend/Postmark) | §16.2 |
| Analytics | Meta Pixel + CAPI, GA4 | §17 |
| Scheduled jobs | Vercel Cron or equivalent | Reservations, reconciliation, reminders |

The stack is a recommendation; a competent developer may substitute equivalents. What is **not** negotiable: a relational database, server-side rendering for indexable pages, webhook-confirmed payments, and configuration held in the database rather than in code.

### 20.2 Non-functional requirements

- **PWA:** installable on iOS Safari and Android Chrome, service worker caching the app shell, offline browsing of previously viewed pages, install prompt (v1.5). Push notifications are out of scope.
- **Responsive:** designed at 375px first; breakpoints 375–767 / 768–1023 / 1024+
- **Browsability under failure:** if Paystack is unreachable, the store remains fully browsable with a clear banner and a WhatsApp path
- **Accessibility:** WCAG 2.1 AA — keyboard navigation, focus states, alt text on every image (enforced in the media library), 4.5:1 contrast, labelled form fields, screen-reader-tested checkout
- **Environments:** local, staging (`noindex`, Paystack test keys), production
- **Backups:** automated daily database backups with point-in-time recovery, and a documented restore procedure that has actually been tested once
- **Error monitoring:** Sentry or equivalent, with alerts on payment and webhook failures
- **Feature flags** for phased rollout without code branching

---

## 21. Design system

This section is the complete visual specification. A developer builds the interface from it without needing separate screen comps. Every value is literal and implementable.

### 21.1 Design intent

**Positioning.** The premium international brands in this category — Luvme, UNice, Nadula, ISEE — compete on promotional intensity: discount codes, points schemes, live streams, sale framing, trademarked feature names. Their interfaces work like high-volume retail.

This brand does not win that fight at ₦185,000. It wins by looking like the price is self-evidently correct. The palette is cherry cola, cream vanilla, and deep violet — wine and velvet rather than clinical minimalism — so the visual reference set is **heritage luxury beauty** rather than hair retail.

**The three rules that produce it:**

1. **Space is the luxury signal.** Where a competitor puts a badge, put nothing.
2. **The brand colour earns authority through scarcity.** Cherry is capped at ~9% of any screen.
3. **One axis, always.** Symmetry on every surface; variety comes from scale, never from breaking alignment (§21.5).

### 21.2 Colour

**Palette: cherry cola and cream vanilla, with deep violet carrying structural weight.** Implement as CSS custom properties; never hardcode hex values in components.

Three named colours is the ceiling. Everything else is a neutral or a derived stop.

#### Cream vanilla — dominant surface

| Token | Hex | Use |
|---|---|---|
| `--vanilla-50` | `#F8F4EF` | Raised cards, and **every surface behind product photography** (§21.9) |
| `--vanilla-100` | `#EFE6DD` | **Page background.** The dominant surface |
| `--vanilla-200` | `#E3D7CA` | Alternating section bands, order summary blocks |
| `--vanilla-300` | `#D2C3B2` | Quiet fills, disabled backgrounds |
| `--vanilla-400` | `#B8A693` | Dividers and hairlines |

`#EFE6DD` is a mid-light cream, not a near-white. Cards sitting on it must therefore be **lighter** (`--vanilla-50`), never white — white reads as a hole punched in the page.

#### Violet — structural weight

| Token | Hex | Use |
|---|---|---|
| `--violet-900` | `#1E1223` | Deepest surfaces, overlay gradients |
| `--violet-800` | `#321847` | **Dark surfaces:** footer, navigation, dark sections, admin chrome. Also eyebrow labels |
| `--violet-600` | `#4E2E68` | Hover state on violet surfaces |
| `--violet-200` | `#C9BDD4` | Borders and muted text on violet surfaces |
| `--violet-50` | `#F0EBF4` | Selected and active tint fills |

Violet exists because cherry at this saturation cannot carry large dark areas — a full-width cherry footer glows. Violet takes the weight so cherry stays scarce. It also preserves a thread of continuity with the brand's earlier plum, which costs nothing and helps recognition.

#### Cherry cola — primary brand

| Token | Hex | Use |
|---|---|---|
| `--cherry-600` | `#9A0002` | **Primary brand.** Filled buttons, links, price, active states |
| `--cherry-700` | `#6B0102` | Hover state, and error text |
| `--cherry-200` | `#E9C7C7` | Borders on cherry tints |
| `--cherry-50` | `#F8EDED` | Tint fills |

#### Ink — text

| Token | Hex | Use |
|---|---|---|
| `--ink` | `#2A1416` | **All body copy, headings, and prose.** A warm near-black with a cherry-brown undertone |
| `--ink-muted` | `#6B5A50` | Secondary text, captions, meta |

**Prose is never cherry.** Saturated red passes contrast but is fatiguing at paragraph length. Cherry is for headings' accents, links, price, buttons, and rules. Pure black is never used — it reads harsh and cheap against cream.

#### The adjacency rule

**Cherry only ever appears on a light surface.** On `--violet-800` sections and in the footer, buttons and links are cream or cream-outlined — never cherry.

Cherry against violet loses its accent function: both are dark and warm, so the red stops reading as emphasis and becomes another dark block. Cherry needs cream behind it to work.

#### Semantic roles

| Role | Treatment |
|---|---|
| Error | `--cherry-700` text with an icon and a written message. Errors are contextual and inline, so there is no confusion with brand use |
| **Low stock / urgency** | **Typographic, never chromatic.** Small uppercase `--ink` with letterspacing. No badge, no red pill |
| **Success (customer-facing)** | **Typographic.** A tick in `--violet-800` plus the words. No green |
| Success (admin only) | `--admin-success` `#2F5A1E`. Status badges in the admin order table, where operator scanning speed outweighs brand expression. **Never customer-facing** |
| Sale price | `--cherry-700`, with the original struck through in `--ink-muted` |

**Why there is no brand green.** Accessibility requires that colour never be the sole carrier of meaning, so a tick and a label are needed regardless — at which point green adds nothing functional and costs palette coherence. Red plus green is also Christmas at any scale. Green is therefore confined to the admin tool.

#### Proportion — the governing constraint

| Layer | Share of surface | Role |
|---|---|---|
| Cream vanilla | ~65% | **Dominant** |
| Violet | ~20% | **Structural weight** |
| Cherry cola | ~9% | **Primary brand** |
| Mid neutrals | ~6% | Bands, dividers |
| Admin green | <1% | Admin only |

**Dominant and primary are deliberately different colours.** Cream owns the surface; cherry owns the identity. **Nine percent is a ceiling, not a target** — at this saturation, more reads promotional rather than premium. Discipline matters more here than with a muted palette, because a saturated red is unforgiving.

**Accent rule:** at most **one** cherry element per viewport, excluding the primary CTA.

### 21.3 Typography

| | Family | Weights |
|---|---|---|
| Display and headings | **Instrument Serif** | 400 only |
| Body and UI | **Instrument Sans** | 400, 600 |

**Why serif.** The two camps in beauty split cleanly: modern minimal brands use sans (Aesop, Byredo, Rhode), heritage luxury uses serif (Dior, Vogue). Sans reads clinical and contemporary; serif reads craft, heritage, and consideration. Cherry cola, cream and aubergine is a wine-and-velvet palette — heritage territory — and a neutral grotesque against it would read as rich colour with cold type. Serif display over sans body is the correct structure.

**Why Instrument Serif specifically.** High contrast, editorial, slightly condensed, quietly fashionable. It reads expensive without tipping vintage — which matters, because a soft or quirky serif combined with cherry red and cream pushes straight into retro-diner territory and amplifies the one real association risk in this palette. Instrument Sans is its designed companion, so the pairing is harmonious by construction. Both are free and self-hostable.

**Alternative if a bolder statement is wanted:** Bodoni Moda for display — a true Didone, fashion-magazine register. Suits the palette; less forgiving at small sizes and in tight layouts.

**Hard constraint: serif is display-only and never below 19px.** High-contrast serifs have thin hairlines that break up at small sizes on low-end Android screens, which is a material share of this traffic. Everything at 17px and below is sans, without exception.

Self-hosted, subset to Latin, one serif weight preloaded. Third-party font origins and additional weights breach the performance budget in §18.4.

#### Scale (mobile first; desktop values in brackets where they differ)

| Style | Size / line-height | Family, weight | Use |
|---|---|---|---|
| Display | 40 / 1.1 [56] | Instrument Serif 400 | Homepage hero only |
| H1 | 32 / 1.15 [40] | Instrument Serif 400 | Page titles |
| H2 | 24 / 1.2 [28] | Instrument Serif 400 | Section headings |
| H3 | 19 / 1.3 | Instrument Serif 400 | Card titles, sub-sections — **the serif floor** |
| Body large | 17 / 1.6 | Instrument Sans 400 | Product description, editorial copy |
| Body | 15 / 1.6 | Instrument Sans 400 | Default UI text |
| Small | 13 / 1.5 | Instrument Sans 400 | Meta, captions, help text |
| Eyebrow | 11 / 1.2 | Instrument Sans 600, `letter-spacing: 0.14em`, uppercase | Labels above headings, in `--violet-800` |
| Urgency | 11 / 1.2 | Instrument Sans 600, `letter-spacing: 0.14em`, uppercase, `--ink` | "Only 2 left" — the typographic urgency signal |
| Price | 22 / 1.2 | Instrument Sans 600, **tabular numerals**, `--cherry-600` | `font-variant-numeric: tabular-nums` so prices align in lists |

**Sentence case throughout**, except eyebrow and urgency labels, which are uppercase. Never Title Case.

**Measure:** body copy capped at 68 characters per line; long-form editorial at 60.

**The wordmark is a fixed drawn asset, not live type.** "YBBEAUTYLOUNGE" set once with deliberate letterspacing and exported as SVG. Wordmarks rendered live in a webfont always look slightly loose, and it must render identically across the site, invoices, packaging, and social templates.

### 21.4 Space, grid, and shape

**Spacing scale (px):** 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Nothing outside this scale.

| Context | Mobile | Desktop |
|---|---|---|
| Page gutter | 20 | 48 |
| Section vertical padding | 56 | 96–128 |
| Card padding | 16 | 24 |
| Gap between related controls | 8 | 8 |
| Gap between control groups | 24 | 24 |
| Gap before primary CTA | 32 | 32 |

**Grid.** 12 columns on desktop, content max-width 1280px, with full-bleed permitted for editorial imagery. Single column on mobile. Product grid: **2 per row maximum on mobile**, 3 on tablet, 4 on desktop.

**Corner radius.**

| Element | Radius |
|---|---|
| Buttons, inputs, cards | **2px** |
| Images | **0** |
| Pills and badges | 100px (the only exception) |

**2px, not 12px.** Large rounded corners read friendly and consumer-tech; near-square reads editorial and expensive.

**Elevation.** No drop shadows anywhere except focus rings. Separation comes from `1px solid var(--vanilla-400)` hairlines and from space. Shadows read as generic e-commerce.

**Focus state.** `box-shadow: 0 0 0 2px var(--cherry-600)` with a 2px offset — and `var(--vanilla-50)` on violet surfaces. Never removed.

### 21.5 The governing idea — the pair

A design system needs one idea that every other decision derives from, or it becomes a menu and the product loses coherence. That idea here is:

> **The pair.** Two states of one subject, held in a stable frame, where all interest comes from the difference between the halves — never from the layout being clever.

This is the before/after. It is the restoration story rendered as composition. And a pair is **structurally symmetrical while being semantically about change**, which means the layout can stay calm while the content carries the drama.

Three consequences, and they are the whole system:

1. **Symmetry is the default on every surface.** No zones, no exceptions to remember. It suits a brand whose stated voice is calm and non-hustle, and it is what reads as trustworthy at this price point.
2. **Variety comes from scale contrast, not from asymmetry.** A full-bleed photograph followed by a narrow 60-character text column. Vast space, then density. Rhythm and drama with every element on one axis.
3. **Motion exists in exactly one place** — dragging the before/after divider. That is the customer exploring the pair. Everything else is still.

### 21.6 Devices — what is adopted, and what is explicitly refused

The quality of a design system is measured by what it refuses. Five devices are adopted; four are refused with reasons, so they do not creep back in.

#### Adopted

| Device | Application |
|---|---|
| **Symmetry** | Every surface — editorial and transactional alike. Centred axes, balanced margins, consistent field widths. No decorative off-axis elements anywhere |
| **The pair (diptych)** | The signature form. Two equal panels, shared frame, single caption beneath. Used on `/restoration`, the gallery, Diary entries, the homepage teaser, and the PDP secondary tab |
| **Framing** | **Frame the evidence, bleed the aspiration.** A pair carries a 1px `--cherry-600` frame so it reads as one object. Editorial photography is full-bleed and unframed |
| **Negative space** | The medium, not a device. Section padding per §21.4. Maximum two products per row on mobile. Where a competitor places a badge, place nothing |
| **Scale contrast** | The source of visual variety, replacing asymmetry. Large image against small type; full-bleed against narrow measure; open space against dense specification tables |

#### Mechanics — not choices

**Grouping** and **accent** are not selections. Proximity encodes relationship in any layout (variant controls at 8px, 24px from price, 32px from CTA — §21.4), and any palette with a hierarchy has an accent, already fixed as cherry in §21.2. They are listed here only so nobody treats them as optional.

#### Refused

| Device | Why it is refused |
|---|---|
| **Tension** | Visual energy contradicts a calm, non-hustle brand voice — the layout would shout while the copy speaks quietly. It is also unnecessary: transformation photography is inherently interesting, and asymmetry would compete with it rather than serve it. Scale contrast supplies variety without breaking the axis |
| **Golden ratio** | In screen layout it is a number chosen for other reasons and justified afterwards. A consistent, memorable proportion matters; that specific proportion does not. Use **60/40** for the desktop PDP split and 3:2 for editorial images, because they are simple and repeatable |
| **Isolated space** | Not a separate device — it is negative space at high intensity. Naming it twice invites inconsistent application. Its intent is preserved in one rule: **one filled button per screen**, and one subject per hero |
| **Decorative movement** | Parallax, auto-advancing carousels, animated counters, page transitions, scroll-jacking. All refused. They cost performance against the §18.4 budget and read as promotional rather than considered. The only motion permitted is the slider drag, plus a single 300ms / 12px fade-up on section entry. Respect `prefers-reduced-motion` |

### 21.7 Components

**Buttons** — 52px height on mobile, 48px desktop. 2px radius. Instrument Sans 600 at 14px, `letter-spacing: 0.02em`.

| Variant | Fill | Text | Border | Use |
|---|---|---|---|---|
| Primary | `--cherry-600` | `--vanilla-50` | none | Add to cart, Pay. **One per screen** |
| Primary on violet | transparent | `--vanilla-50` | 1px `--vanilla-50` | The same action on a dark section — **never cherry on violet** (§21.2) |
| Secondary | transparent | `--ink` | 1px `--ink` | Ask on WhatsApp, secondary actions |
| Text | none | `--cherry-600` | none, underline on hover | Tertiary |
| Destructive | transparent | `--cherry-700` | 1px `--cherry-700` | Admin only |

Full width on mobile for primary purchase actions. Hover: `--cherry-700`. Active: `scale(0.99)`. Disabled: avoid — keep enabled and explain on use.

**Inputs** — 52px height, 2px radius, `--vanilla-50` fill, 1px `--vanilla-400` border, 15px Instrument Sans. Label above in Eyebrow style, `--violet-800`. Focus ring per §21.4. Error state: 1px `--cherry-700` border with a 13px `--cherry-700` message and icon below.

**Product card** — image at 4:5 on `--vanilla-50`, zero radius, full-bleed within the card. Below: texture in Eyebrow style / `--violet-800`; name in H3 / `--ink`; price in Price style / `--cherry-600`; rating and review count in Small / `--ink-muted`. No border, no shadow — separated by space alone. Low stock shown in Urgency style, not as a badge.

**Badges** — 100px radius, 11px Instrument Sans 600, uppercase. New: `--violet-50` fill with `--violet-800` text. Sale: `--cherry-600` fill with `--vanilla-50` text. **No urgency badges** — urgency is typographic (§21.2).

**Before/after diptych** — two equal panels on `--vanilla-50`, a 1px `--cherry-600` frame around the pair, draggable divider as a 2px `--vanilla-50` bar with a 40px circular handle. "Before" and "After" in Eyebrow style on `--violet-800` pills at 80% opacity. The frame is the one place cherry is used structurally rather than as an accent — it marks the brand's signature form.

**Section band** — alternating `--vanilla-100` and `--vanilla-200`, with occasional full-width `--violet-800` sections for emphasis. Never a border between sections; the colour change is the separator.

**Navigation** — `--vanilla-100` background, sticky, 1px `--vanilla-400` bottom hairline. Wordmark as the fixed SVG asset (§21.3). Links in 15px Instrument Sans, `--ink`, cherry underline on active. Mobile: hamburger opening a full-screen `--violet-800` overlay with `--vanilla-50` links.

**Footer** — `--violet-800` background, `--vanilla-50` text, `--vanilla-400` hairline rules at 30% opacity between column groups. Links underline on hover; no cherry.

**Admin status badges** — the one place colour is used functionally for scanning: paid `--admin-success` `#2F5A1E` on a 12%-opacity tint; pending `--violet-800` on `--violet-50`; shipped `--ink` on `--vanilla-200`; cancelled `--cherry-700` on `--cherry-50`.

### 21.8 Page layout direction

| Page | Layout |
|---|---|
| **Home** | Full-bleed hero at 60vh, headline lower-centre, one primary CTA. Then alternating vanilla bands per §8.1, with one `--violet-800` section for the restoration teaser |
| **Shop** | Texture lookbook cards stacked full-width, each 3:2 with an overlaid title. Filter row as horizontally scrollable pills below. Product grid 2-up mobile |
| **PDP** | Desktop: 60% gallery / 40% purchase block, purchase block sticky on scroll. Mobile: gallery, purchase block, attributes, reviews. Sticky Add to cart bar appears after the gallery scrolls out. Gallery background `--vanilla-50` |
| **Collection** | Full-bleed hero, centred intro at 60-character measure, then the grid. Scale contrast carries the rhythm — wide image, narrow text |
| **Cart / checkout** | Single centred column, max 560px. Order summary in a `--vanilla-200` block |
| **Restoration** | Full-bleed hero, centred tier cards, diptych gallery, intake form in a centred block. A `--violet-800` band behind the service explanation |
| **Diary** | Chronological single column. Each entry: full-bleed diptych where a before/after exists, centred caption beneath at narrow measure. Consistent, never alternating sides |
| **About** | Long-form centred at 60-character measure, full-bleed images interrupting the text column |
| **Admin** | Symmetrical and dense. `--violet-800` chrome, `--vanilla-100` content, hairline-separated table rows rather than cards |

### 21.9 Imagery treatment

Warm, editorial, intentional — never bright generic e-commerce lighting. Zero corner radius on all photography. No borders except on diptychs. No colour overlays; where text sits on an image, use a bottom-up `--violet-900` gradient at 0–60% opacity rather than tinting the whole frame.

#### The product-on-vanilla-50 rule — non-negotiable

**Product photography always sits on `--vanilla-50` (`#F8F4EF`). Never on `--vanilla-200` or darker, never on violet, never on cherry.**

The product is dark, glossy hair. `#EFE6DD` is a mid-light cream and the mid neutrals are warmer and darker still; dark hair against them loses edge definition and reads muddy. `--vanilla-50` is the lightest surface in the system and gives the hair maximum separation.

| Surface | Permitted background |
|---|---|
| Product images, PDP gallery, product cards, diptychs | `--vanilla-50` only |
| Text blocks, summary panels, quiet bands, tier cards | `--vanilla-100` / `--vanilla-200` |
| Chrome, footer, nav, dark sections, admin | `--violet-800` |
| Buttons, links, price, active states, diptych frame | `--cherry-600` |

Shoot on a light backdrop (§0.2) so the hair separates. Competitors use high-contrast white for exactly this reason; `--vanilla-50` achieves the same separation while keeping the palette's warmth.

### 21.10 What not to do

Explicitly out of bounds, because each undermines the positioning:

- Drop shadows, gradients as decoration, glows
- Corner radius above 2px on anything but pills
- More than one filled button per screen
- **Cherry on a violet surface** — it stops functioning as an accent (§21.2)
- Cherry used for body copy or long-form prose
- A green anywhere on a customer-facing surface
- Urgency expressed as a coloured badge rather than typographically
- Pure black text, or pure white surfaces
- Countdown timers, spinning discount wheels, exit-intent popups
- Auto-advancing carousels, parallax
- More than two products per row on mobile
- Stock photography of unrelated models
- Title Case, or ALL CAPS outside eyebrow labels
- Cherry covering more than ~9% of a screen
- Product photography on anything other than `--vanilla-50` (§21.9)
- A fourth brand colour. Three is the ceiling
- Serif type below 19px (§21.3)
- Any off-axis or asymmetric composition — the axis is never broken (§21.5)
- Alternating left/right layouts to create variety; use scale contrast instead

### 21.11 Before/after placement

The diptych is the brand's signature form — and the one place cherry is used structurally, as the frame. It belongs where the story is true: `/restoration`, the Diary, the restoration gallery, and the homepage teaser.

**It must not occupy the primary gallery position on a product page** — that puts the signature motif in competition with the conversion job of the highest-value screen. A customer buying a new wig wants to see the wig. On a PDP it is a secondary tab, present only where a genuine restoration pair exists.

### 21.12 Name the restoration service

Premium competitors trademark ordinary product features — a lace finish, a cap construction — and market them as named technologies. This brand's restoration and revamp service is a materially stronger asset than any of those, and it is currently described rather than named.

**Requirement:** the service carries a name, used consistently across `/restoration`, the Diary, product page before/after tabs, packaging, and email. The system supports this with no special work — it is a content decision, recorded here because it is the cheapest premium signal available and the only one competitors cannot copy.

Founder decision, not a developer task. Flagged in §25.

### 21.13 Tone and copy

Calm, personal, close to natural speech. First person where the founder speaks. Restoration and renewal metaphors where they land naturally, never forced. No hustle-culture vocabulary, no exclamation marks in system copy, no "simply" or "just". Sentence case. Say what a thing does rather than how transformative it is.

### 21.14 Cross-touchpoint consequence

The brand's existing invoice and social presence use pink/mauve. The site palette is cherry cola, cream vanilla, and violet. Either the invoice, packaging, Instagram templates, highlight covers, and existing ad creative move to this system, or the touchpoints disagree — and §4 lists brand consistency as a success metric.

The migration is less severe than it first appears: cherry and violet both sit in the same warm red-purple family as the existing mauve and plum, so this is a deepening rather than a reset. The wordmark asset (§21.3) is the first thing to produce, because everything else follows from it.

A rebrand decision outside the build, but the build will expose it. Flagged in §25.

## 22. Error and edge-case flows

Each of these will occur within the first month of live trading. Specify the behaviour now rather than discovering it against a real customer.

| Scenario | Required behaviour |
|---|---|
| Payment fails | Order stays `pending` and recoverable; retry link; reservation held until expiry; clear message |
| Payment succeeds, webhook missed | Reconciliation job catches it within 15 min (§15.4); customer sees pending with reassurance |
| Stock gone between checkout and payment | Decrement fails, order flagged, founder emailed, customer contacted with refund or alternative |
| Two customers, last unit | Reservations make this deterministic; second customer sees out-of-stock at checkout |
| Address outside delivery zones | Clear message + WhatsApp route; no payment attempted |
| Non-Nigerian country selected | WhatsApp route; no payment attempted |
| Invalid or expired discount code | Specific reason ("expired", "minimum order not met"), not a generic failure |
| Self-referral attempt | Silently rejected; order proceeds without discount, with a clear notice |
| Balance unpaid past due | Reminder, then configurable cancellation with stock restored |
| Review submitted twice on one token | Token single-use; second attempt shows the existing review |
| Email bounces | Logged, flagged in admin on the customer record |
| Paystack down | Store browsable, banner shown, WhatsApp path offered |
| Image upload fails | Clear error, no orphaned records, retry available |
| Restoration capacity reached | Intake shows waitlist message instead of accepting work |
| Admin enters an invalid setting | Rejected server-side with the valid range stated (§12.4) |

---

## 23. Rollout plan

| Phase | Scope | Gate to proceed |
|---|---|---|
| **0** | Domain and email authentication; **Paystack test keys obtained (instant, no verification) and live-account verification started in parallel**; NDPC registration; legal pages drafted. Photography runs as a parallel track (§0.3) — it does not gate development | Test keys working |
| **1** | Storefront read-only: home, shop, search, PDP, length guide, FAQ, about, policies. WhatsApp as the buy path. Deployed and indexable | Traffic and enquiry data collected |
| **2** | Cart, checkout, Paystack with all channels, payment plan, order confirmation, order tracking, email notifications | Test transactions pass; webhook verified end to end |
| **3** | Admin: products, variants, media library, orders, customers, inventory, discounts, settings, audit log | Founder runs a full week of real orders through admin without the spreadsheet |
| **4** | Reviews (submission, moderation, display), restoration intake and job pipeline, homepage builder, pages and FAQ editing | First reviews live; first restoration job through the pipeline |
| **5** | v1 launch: SEO, PWA, analytics and CAPI, consent, error flows, staging, backups verified | Acceptance criteria (§24) all pass |
| **6** | v1.5 in the priority order given in §6, each item gated on a metric | — |
| **7** | v2: wholesale first | v1 metrics justify it |

Phase 1 deploying before checkout exists is deliberate. It validates traffic, tests the photography against real audiences, and starts accumulating SEO age while the commerce layer is built.

---

## 24. Acceptance criteria for v1 launch

This is the definition of done for v1. Nothing outside this list blocks launch; everything inside it does.

**Customer can:**
- Browse texture-first, search, filter by texture / length / colorway / lace type / density / cap size, and sort
- View a product with full attributes, real photography, variant selection with per-variant price and stock, and reviews
- See the length guide and understand what each length means
- Add to cart, see the free-delivery progress, apply a discount code
- Complete guest checkout in under five steps, paying in full, by 50% deposit, or in 4 instalments, using card, bank transfer, or USSD
- Receive an order confirmation email within two minutes, and send the receipt to their own WhatsApp in one tap
- Track the order at `/track` with order number and phone, without an account
- Submit a review with photos from the emailed link after delivery
- Raise a return request against an eligible order, attach photos, and see its status without messaging anyone
- Submit a restoration enquiry with photos, receive a quote, accept it, and pay a deposit
- Reach WhatsApp from any page
- Read the FAQ, returns, privacy, and terms
- Do all of the above on a 375px screen on a Nigerian mobile connection, with LCP under 2.5s

**Founder can, without a developer:**
- Add, edit, duplicate, and archive products with variants, prices, cost prices, and stock
- Upload and reuse images from a folder-organised media library
- Create a collection and a landing page, and reorder the homepage
- Create a discount code with limits and a date range
- View, filter, and export orders in columns matching the existing spreadsheet
- Update fulfillment status, enter courier and tracking, record a manual payment, issue a refund, and message a customer on WhatsApp in one tap
- See a customer's full order history, lifetime value, and store credit
- Moderate and reply to reviews
- Approve or decline a return request, record the outcome, and issue store credit
- Move a restoration job through the pipeline, send a quote, and close it (with before/after photos required)
- Edit FAQ, policy pages, and every email template, and toggle any email event
- Change delivery zones and fees, the free-delivery threshold, the VAT rate, payment channels, and referral values
- See revenue, margin, AOV, funnel conversion, top products, and the self-serve versus WhatsApp-assisted split

**The system must:**
- Compute every price server-side and reject client-supplied prices
- Verify the Paystack webhook signature, assert the amount, and be idempotent
- Reconcile missed webhooks within 15 minutes
- Reserve stock at checkout and decrement only on confirmed payment, handling failure explicitly
- Block dispatch on any order with an outstanding balance, on either instalment plan
- Record every consent with wording, timestamp, and IP
- Log every money-affecting change with actor and before/after values
- Render indexable pages server-side with `Product`, `FAQPage`, and `AggregateRating` schema, a sitemap, and 301 redirects on slug change
- Send Pixel and CAPI events with shared `event_id`s, `Purchase` fired from the webhook
- Pass a tested database restore
- Remain browsable with a WhatsApp path when Paystack is unavailable

---

## 25. Open questions

### Blocking — must be answered before or during build

| # | Question | Recommended default if unanswered |
|---|---|---|
| 1 | Delivery fee per zone — the actual naira amounts | Four zones seeded (Lagos, South-West, other Nigeria, international-manual); founder edits in admin |
| 2 | Free-delivery threshold | ₦200,000, editable |
| 3 | Payment plan — enable at launch? Deposit percentage? | Enabled, 50%, balance due before dispatch |
| 4 | Returns policy — window, who pays return shipping, exchange or refund | **30 days**, matching the international premium standard (Appendix B.2), with the protections those brands use: unused and in original packaging, and **restored, custom, or handmade units excluded**. An earlier draft of this document recommended 48–72 hours based on local practice; that was benchmarked too low for this brand's price position. **Lawyer review required** |
| 5 | Restoration service tiers and starting prices | Founder must supply; the page cannot ship without them |
| 6 | Restoration capacity cap — concurrent jobs | 5 |
| 7 | Email provider — Brevo alone, or split transactional/marketing | Brevo alone at launch, interface built for switching |
| 8 | Product attribute values actually stocked — lengths, densities, weights, draw types, lace sizes, cap sizes, origins, grades | The **attribute schema** is now specified from market research (Appendix B) and is admin-extensible. The founder supplies only the **values actually stocked**, which seed the filters |
| 9 | Are the assets in Section 0 shot? | **Blocking. Nothing starts until answered** |

### Deferrable — decide before the phase that needs them

| # | Question | Note |
|---|---|---|
| 10 | International payments — Stripe for UK/US/Ghana, or WhatsApp routing | v1 routes to WhatsApp. Revisit when international volume justifies a second processor |
| 11 | Will a team member need admin access | Permissions and audit log built in v1, exposed when needed |
| 12 | Referral reward values | Defaults in §14.5 seeded; tune from data |
| 13 | Digital products — does content exist to sell | v2. Nothing to build until there is something to sell |
| 14 | Wholesale tier structure and minimums | v2, specified in §10 |
| 15 | Blog cadence and who writes it | v1.5. A blog with no publishing rhythm is worse than no blog |
| 16 | **Name for the restoration service** (§21.4) | Founder decision. Needed before the restoration page copy is written, not before the build starts |
| 18 | **Palette migration** — when do the invoice, packaging, Instagram templates, and existing ad creative move to cherry/vanilla/violet? (§21.14) | They should move, and the wordmark asset comes first. Because cherry and violet sit in the same warm family as the current mauve and plum, this is a deepening rather than a reset — a designer for a day or two, not a rebrand. Price the affected paid ad creative before committing |
| 19 | **Sense-check the palette with real customers** before the build commits to it | Lower stakes than an unfamiliar colour direction would be — deep red is category-native in beauty and unlikely to surprise — but the palette is still the hardest thing to change after launch. Cheap test: mock one product page and put it against an alternative on Instagram stories as a poll. A day's work for a real answer |
| 20 | Display typeface — Instrument Serif as specified, or Bodoni Moda for a bolder fashion register? (§21.3) | Instrument Serif. Bodoni is the stronger statement but less forgiving at small sizes and in tight layouts. Either can be swapped in one token change |
| 17 | Instalment plan — enable 4-payment plan at launch, or start with 50/50 only? | Build both; enable 50/50 at launch and switch the 4-payment plan on once order volume makes the reminder workload visible |

**On question 15 specifically:** tie content production to work that already happens rather than creating a new obligation. The restoration content loop (§9.4) is the model — the Diary fills itself because closing a paid job requires the photos. Apply the same thinking to the blog: it should be a byproduct of the YouTube cadence that already exists, not a separate weekly commitment that will quietly lapse by week six.

---

## 26. Appendix A — Decisions log

Every non-obvious decision in this specification, with its reason. A developer does not need this section to build; it exists so that when someone later asks "why was it done this way," the answer is on record rather than re-argued.

| Area | Decision | Reason |
|---|---|---|
| Scope | v1 cut to a launchable core; everything else queued behind a metric (§6) | A twenty-route, seven-revenue-stream first release slips and launches nothing |
| Imagery | Upload accepts any source and derives every crop; nothing rejected on aspect ratio (§0.1) | The founder shoots on phone, camera, and laptop. Restricting shapes makes the system unusable by the person who runs it |
| Imagery | Multi-ratio cropper with zoom and reposition per output | One upload must serve the card, thumbnail, hero, and banner without re-uploading |
| Imagery | Focal point per image | Prevents automatic centre-cropping from cutting a model's head off in the hero slot |
| Photography | Treated as a parallel launch track, never a gate on development (§0) | The build proceeds against placeholders. Only launch requires real assets |
| Trust | Reviews, order tracking, and FAQ are all v1 (§8.6, §8.10, §8.12) | At ~₦185,000 from a brand met through an ad, evidence matters more than features |
| Reviews | Submission only via a tokenised post-delivery email | Makes every review a verified purchase and review fraud structurally impossible |
| Payments | Two instalment plans, dispatch withheld until fully paid (§14.6) | Pay-in-4 is the international standard; withholding dispatch removes all credit risk since no underwriter exists locally in Nigeria |
| Payments | Card, bank transfer, USSD and bank all enabled (§15.2) | Card penetration and failure rates in Nigeria make card-only a revenue leak |
| Payments | Webhook-only confirmation, plus a 15-minute reconciliation job (§15.3–15.4) | Client redirects can be forged; webhooks can be missed. Both failure modes must be covered |
| Payments | Full integration built in test mode from day one; live account verification runs in parallel (§15.7) | The money-handling code shape is architectural, not a bolt-on. Only the paperwork is deferrable |
| Data | Customer record created silently at first order, keyed on normalised phone (§13.1) | The only way to measure repeat purchase, and it removes a migration when accounts arrive |
| Data | Cost price on the variant, snapshotted onto the order item (§13.2) | Cost varies by length and colour; without the snapshot, historical margin rewrites itself |
| Data | Store credit as a transaction ledger, not a mutable balance (§13.5) | Makes "why does this customer have ₦10,000?" answerable |
| Data | All money as integers in kobo | Float arithmetic on currency produces reconciliation failures nobody can explain |
| Referrals | Fixed naira store credit, not a percentage; released after the return window (§14.5) | A percentage scales the giveaway with the most expensive product. Credit keeps money in the system and avoids a payout process |
| Restoration | Full service pipeline with quote, deposit, and customer-visible status (§9) | It is a capacity-bound service business, and it is the brand's differentiator |
| Restoration | Before and after photos required to close a job (§9.4) | Converts content production from a separate chore into a byproduct of paid work |
| Notifications | Email automated; WhatsApp reached via customer-initiated links (§16) | Avoids the WhatsApp Business API subscription while still landing records where Nigerian customers read them |
| Admin | Four-tier configuration boundary (§12) | Makes "the founder never needs a developer" precise enough to build against |
| Admin | Attribute lists as admin tables, not code enums (§13.2) | This category's vocabulary shifts seasonally; enums convert each shift into a paid deployment |
| Admin | Permissions and audit log built in v1, exposed later (§5, §11.14) | Retrofitting an audit log after a team member joins is far harder than building it now |
| Benchmark | Measured against international premium DTC brands, not the local mass market (Appendix B.2) | At this price point that is the comparison set a customer actually makes |
| Returns | 30 days, unused and in original packaging, restored and custom units excluded (§25 q4) | Matches the premium standard while adopting the same exclusion those brands use to manage custom-work risk |
| Design | **Cherry cola `#9A0002` primary, cream vanilla `#EFE6DD` dominant, deep violet `#321847` for structural weight** (§21.2) | Founder direction. Chosen over an olive alternative on three grounds: lower migration cost from the existing mauve identity, category fluency (red is beauty's native colour), and it does not threaten dark-hair photography the way a muted mid-tone does |
| Design | Dominant colour (cream) deliberately differs from primary brand colour (cherry), capped at ~9% | A brand colour earns authority through scarcity. A saturated red is unforgiving — past roughly 9% it reads promotional rather than premium |
| Design | **Violet added as a third colour purely to carry dark surfaces** | Cherry at this saturation cannot hold large areas; a full-width cherry footer glows. Violet takes the weight so cherry stays scarce, and it retains continuity with the brand's earlier plum |
| Design | **Cherry never appears on a violet surface** | Both are dark and warm, so cherry stops reading as an accent and becomes another dark block. Discovered by rendering the two adjacent |
| Design | **No brand green. Urgency and success are typographic, not chromatic** | Accessibility already requires a label and an icon, so colour adds nothing functional; red plus green is Christmas at any scale. A muted green survives in the admin order table only, where operator scanning speed outweighs brand expression |
| Design | Candidate colours aureolin, lime green, vibrant red and imperial red all refused (§21.2) | Aureolin and lime are effectively invisible on cream (1.1:1 and 1.05:1). Vibrant red fails contrast and introduces a second, conflicting red — the archetypal sale colour. Imperial red fails for text and duplicates the derived cherry tint |
| Design | **Instrument Serif display over Instrument Sans body; serif never below 19px** (§21.3) | A wine-and-velvet palette is heritage territory, where serif reads as craft and sans reads as clinical. Instrument Serif is editorial without tipping retro — the risk a softer serif would amplify next to cherry and cream. The 19px floor exists because high-contrast hairlines break up on low-end Android screens |
| Design | Wordmark produced as a fixed SVG asset rather than live webfont type | Live-rendered wordmarks look loose, and it must render identically across site, invoices, packaging, and social |
| Design | 2px corner radius, no shadows | Near-square and hairline-separated reads editorial and expensive; large radii and shadows read consumer-tech and generic |
| Design | **One governing idea — "the pair"** — from which every other design decision derives (§21.5) | A system that adopts every available device is a menu, not a system, and produces exactly the inconsistency it was meant to prevent |
| Design | Symmetry everywhere, with **no editorial/transactional zoning** | Visual tension contradicts a calm, non-hustle brand voice, and the transformation photography already supplies the interest that asymmetry would otherwise provide |
| Design | Variety supplied by **scale contrast**, not asymmetry (§21.6) | Delivers rhythm and drama while keeping every element on one axis |
| Design | **Tension, golden ratio, isolated space, and decorative motion explicitly refused** (§21.6) | Recorded as refusals with reasons so they do not creep back in during build or later redesign |
| Design | **Product photography only ever on `--vanilla-50` `#F8F4EF`** (§21.9) | Dark glossy hair against the mid-light page cream or any warmer neutral loses edge definition and reads muddy — the one way this palette could damage the product |
| Design | Diptych adopted as the signature form (§21.6) | Before/after *is* a diptych — the one design device that maps directly onto the brand's story |
| Design | Serif display with sans body (§21.2) | Editorial rather than templated, consistent with the brand's tone |
| Design | Before/after demoted to a secondary tab on product pages (§21.3) | On a new-wig page the motif competes with the conversion job. It belongs where the story is true |

---

## Appendix B — Market research: product attributes and category norms

Researched 26 July 2026 across Nigerian and international wig retailers to establish the attribute schema in §13.2 and §8.4.

### B.1 Attributes the market publishes

| Attribute | Observed values | Source of practice |
|---|---|---|
| Texture | Bone straight, body wave, deep wave, kinky curly, afro curly, funmi curl, bob | Universal |
| Length | Stated in inches; grouped short ≤12", shoulder 13–14", medium 15–17", long ≥18" | International retailers |
| Density | 130 / 150 / 180 / 200 / 250%, with 150% the most commonly stocked; Nigerian listings extend to 300% | Universal, both markets |
| **Weight (grams)** | 220g, 250g, 450g quoted in listing titles | **Nigerian-market specific** |
| **Draw type** | Single, double drawn, super double drawn ("SDD") | **Nigerian-market specific; primary quality signal** |
| Lace type | HD lace, transparent Swiss, standard | Universal |
| Lace size | Frontal 13x6 / 13x4 (ear to ear); closure 5x5 / 4x4 / 2x6 / 2x4 (crown only) | Universal |
| Cap size | Quoted in inch ranges — 21"–21.75", 21.75"–22.5"; adjustable straps and combs standard | International retailers |
| Hair origin | Vietnamese, Brazilian, Burmese, Peruvian, Indian. Nigeria has no domestic hair source; stock is imported chiefly from Southeast Asia, China, and India | Both |
| Grade | 7a, 10a | Nigerian wholesalers |
| Pre-plucked / baby hair | Yes / no | Universal |
| Colourable / heat-styleable | Human hair can be professionally dyed and bleached | Universal |
| Style detail | "Lagos hairline" / widow's peak is a locally marketed style attribute | Nigerian-market specific |

### B.2 The competitive set — international premium, not local mass market

**Correction to an earlier draft.** An earlier version of this appendix benchmarked against Nigerian mass-market sellers. That was wrong for this brand's position. At ~₦185,000 the comparison set a customer actually makes is the international premium DTC brands — Luvme Hair, UNice, Nadula, ISEE, She's Happy Hair, London Virgin Hair — several of which ship to Nigeria. The standard below is theirs.

| Standard | Observed practice | Implication for this build |
|---|---|---|
| **Instalments** | Near-universal: 4 interest-free payments over 6 weeks (Klarna, Afterpay, Zip, Sezzle, Affirm, Shop Pay). One brand states most of its customers use a payment plan | §14.6 upgraded from 50/50 only to include a 4-instalment plan |
| **Monthly price framing** | Instalment amount displayed on homepage and product pages, e.g. "pay as low as $84/month" | Show "or 4 payments of ₦46,250" on the PDP (§8.4, §14.6) |
| **Returns** | 30-day window standard. Conditions: unused, original packaging. **Handmade and custom wigs excluded** | §25 q4 revised from 48–72 hours to 30 days with the same exclusions |
| **Free shipping** | Widely offered, sometimes worldwide | Free-delivery threshold (§14.3) is the affordable local equivalent |
| **Virtual try-on** | AI face-mapping try-on, explicitly positioned as reducing returns; app-first, phone camera or uploaded photo | Move from "bet" to a dated v2 roadmap item |
| **Loyalty points** | Membership schemes, points redeemable against purchase (100 points = $1) | v2, aligns with store credit ledger already in §13.5 |
| **Live shopping** | Scheduled weekday live streams with limited-time discounts | Not in scope; note as a marketing channel that needs no build beyond discount codes (§11.9) |
| **Named feature branding** | Product *features* trademarked and marketed: "Bye Bye Knots™", "Bye Bye Slip™", "All-Day Comfort™", "Invisi Drawstring Cap", "Pre-everything" | Zero-cost premium signal. The restoration story is a stronger asset than any of these and is currently unnamed |
| **Delivery transparency** | Processing time and shipping time stated separately (e.g. 1 business day to process); contact within 24 hours if there is an order issue | Add to `/faq` and the PDP delivery estimate |
| **Social proof at scale** | Volume claims on the homepage — "join 10,000+ women who trust…" | Trust strip (§8.1) should carry real numbers once available; never fabricated |
| **Multiple warehouses** | Regional warehouses to shorten delivery | Not applicable at this stage; Lagos same-day is the local equivalent advantage |

#### The most significant finding

**An international premium brand already runs this exact service model.** London Virgin Hair offers lace replacement and reconstruction as paid services, and its returns centre handles both product returns and customers sending a wig in for servicing.

Two conclusions follow. First, the restoration and revamp service (§9) is not a local curiosity bolted onto a product business — it is a validated premium positioning, and it should be presented with that confidence rather than as a side offering. Second, that brand manages the return-risk problem created by custom work by **excluding handmade and serviced items from the return window**. Adopt the same exclusion.

#### Local market context (secondary, not the benchmark)

Retained because it affects operations rather than positioning:

- **Payment channels.** Established Nigerian sellers accept card, bank transfer, and USSD. Confirms §15.2 is the local baseline
- **Delivery.** Same-day Lagos delivery with an afternoon cut-off is advertised locally — a genuine advantage international competitors cannot match, and worth stating prominently
- **Attribute vocabulary.** Weight in grams and draw type (double drawn / SDD) are how the Nigerian market signals quality; the international set leads with density percentage. Support both (B.1)
- **Price dispersion.** Local pricing for premium bone straight ranges very widely, and inconsistency between vendors is openly acknowledged in the market. At ~₦185,000 this brand sits in the upper-mid premium band, which is precisely why the trust infrastructure in §8 — reviews, tracking, verified attributes, published policies — carries disproportionate weight. It is the evidence that justifies the price
- **Density and length interact.** A shorter unit reads fuller than a longer one at identical density. State this in the length guide (§8.5); it prevents a predictable class of complaint

### B.3 The implication for admin

Every list in B.1 is an admin-managed lookup table (§13.2). The category's vocabulary changes seasonally — new lace sizes, new quality signals, new textures. Hardcoding them as enums converts each market shift into a paid deployment. This is the founder's "admin handles it without code" requirement applied at the attribute layer, and it is the single most likely place for a developer to take the shortcut.

---

*End of document. Version 4.0 — 26 July 2026. Standalone specification for a new build. Appendix A records the reasoning behind each decision; Appendix B records the market and regulatory research underpinning them.*
