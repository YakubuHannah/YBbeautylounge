# Project rules — YBBeautylounge

## What this project is

A production e-commerce platform for YBBeautylounge, a Nigerian premium wig brand selling at around ₦185,000 per unit, plus a wig restoration service, plus an admin panel through which the founder runs the entire business without a developer.

**The specification is `docs/PRD.md`. It is the single source of truth.** Do not invent requirements. Do not deviate without saying so. If the specification and this file ever disagree, the specification wins — and tell me, because one of them needs fixing.

## The governing principle

The founder must be able to run the entire business from the admin panel without a developer. §12 defines the boundary precisely. In practice:

- **Rates, values, lists, and content are data.** VAT rate, delivery fees, referral amounts, attribute options, email wording, page copy — all rows in the database, editable in admin.
- **Rules are code.** How VAT is calculated, how stock decrements, how credit is awarded.

If you are about to write an enum, a constant, or a hardcoded string for something the founder would plausibly change more than once a year, **stop — it belongs in the database.**

## Never negotiable

1. **Server-side pricing.** The client sends variant IDs and quantities. Never a price. A request containing a price is rejected.
2. **Webhook-only payment confirmation.** Verify the HMAC SHA512 signature against the raw request body. Assert the paid amount equals the stored total in kobo. Make the handler idempotent — Paystack retries.
3. **No client-side authentication.** Hiding a route in the browser is not access control.
4. **Allow-list serialisation on every public endpoint.** Named fields only, never whole model objects. `cost_price`, internal notes, and other customers' data must never reach the client.
5. **Configuration lives in the database, not in code.** Settings, attribute lists, email templates, and content are rows the founder edits. No enums for anything the founder would change.
6. **All money is integers in kobo.** Never a float. Ever.
7. **Two independent order state machines.** `payment_status` and `fulfillment_status`. `paid` never appears in the latter.
8. **Dispatch blocked in code** while an order has an outstanding balance. Not by operator discipline.
9. **Every money-affecting setting is range-validated server-side and written to the audit log** with actor and before/after values.
10. **Colours only via CSS custom properties.** No hex literals in component files.
11. **Serif type never below 19px** (§21.3). Cherry never on a violet surface (§21.2). Product photography only on `--vanilla-50` (§21.9).

## How to work

### Think before coding

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — do not pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop, name what is confusing, and ask. A wrong guess in the schema or the money path costs days; a question costs one message.

### Simplicity first

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No configurability that was not requested — **except** where §12 requires it, which is the one deliberate exception in this project.
- No error handling for impossible scenarios.
- If you wrote 200 lines and it could be 50, rewrite it.

Test: would a senior engineer call this overcomplicated? If yes, simplify.

### Surgical changes

- Touch only what the task requires.
- Do not "improve" adjacent code, comments, or formatting.
- Do not refactor what is not broken.
- Match the existing style even if you would do it differently.
- If you notice unrelated dead code, mention it — do not delete it.
- Remove imports and variables that **your** change orphaned. Nothing else.

Test: every changed line traces directly to the current task.

### Goal-driven execution

Turn every task into something verifiable before starting:

```
1. [step] → verify: [check]
2. [step] → verify: [check]
3. [step] → verify: [check]
```

- "Add validation" becomes "write tests for invalid inputs, then make them pass".
- "Fix the bug" becomes "write a test that reproduces it, then make it pass".

Never report a task complete on the basis that the code looks right. Run the check.

### One milestone at a time

Do not start the next milestone until I confirm the current one. Do not build ahead. If you finish early, say so and stop.

## Testing floor

Tests are required for these, and only these — do not chase coverage elsewhere:

- Price computation: subtotal, delivery, discount, VAT, total
- Webhook handling: valid signature, invalid signature, amount mismatch, duplicate delivery
- Stock: reservation, expiry, decrement, oversell failure path
- Order state transitions, including every illegal transition
- Referral eligibility, including self-referral rejection
- Phone normalisation: `0803…`, `+234803…`, `234803…`, and spaced variants all resolving to one customer
- Discount validation: expired, below minimum, over usage limit, wrong scope
- Return eligibility windows and exclusions

If you change any of the above, the corresponding test runs before you report done.

## Commit convention

One logical change per commit. Reference the specification section:

```
feat(checkout): server-side price computation per §14.1
fix(webhook): assert amount in kobo not naira per §15.3
chore(tokens): cherry and vanilla CSS variables per §21.2
```

## Environment and locale

- Language English (en-NG), single language, no i18n framework
- Currency NGN, displayed `₦185,000`, no decimals for whole naira, stored in kobo
- Timezone `Africa/Lagos` for all scheduled jobs, timestamps, and reports. Store UTC, render Lagos
- Target device: mid-range Android on a throttled connection. Test there, not on a desktop simulator
- Secrets in environment variables only. Never committed, never in code

## When you are stuck or the spec is silent

Ask. Do not improvise business logic, pricing rules, payment behaviour, or data shapes. Improvising UI copy is acceptable if you flag it as placeholder; improvising anything touching money, stock, or customer data is not.

## Build commands

```bash
npm run typecheck   # TypeScript type checking
npm run lint       # ESLint linting
npm test           # Vitest tests
npm run build      # Production build
npm run dev        # Development server
```

## Key sections to reference

- §13: Full data model
- §12: Admin vs code boundary
- §14.1: Server-side price computation
- §15.3: Webhook handling
- §21.2-21.4: Design tokens
- §21.7: Button variants
- §0.1: Media upload requirements