# Code Quality Audit — The Meliza Lounge
**Date**: 2026-04-24  
**File**: `meliza-lounge.jsx` (607 lines)  
**Overall Score**: **6.5 / 10**

---

## CRITICAL
None.

---

## MAJOR

| # | Area | Finding | Line |
|---|------|---------|------|
| M1 | Correctness | **Timezone-unsafe date parsing** — `new Date(dateString + 'T00:00:00')` causes wrong day-of-week. Monday detection breaks for non-local users. | 69, 412 |
| M2 | Security | **No input validation** — name, email, phone accept arbitrary input beyond HTML5 `type` attributes. No regex/format checks. | 442, 504, 517, 526 |
| M3 | Security | **Email-only login** — anyone can impersonate any email. Documented MVP limitation but must never go to production as-is. | 122 |
| M4 | Security | **Portfolio delete has no confirmation** — `handleDeletePortfolio` silently deletes; appointments use `confirm()`, portfolio does not. | 205 |
| M5 | Maintainability | **Monolithic component** — 21 state variables, 607 lines, zero separation of concerns. At maximum acceptable size. | 1–607 |
| M6 | Performance | `availableSlots`, `minDate`, `userAppointments` recomputed on every render. Should be `useMemo`. | 216–218 |

---

## MINOR

| # | Finding | Line |
|---|---------|------|
| m1 | `BUSINESS_HOURS_START` and `BUSINESS_HOURS_END` constants defined but never used. | 57–58 |
| m2 | Business info card says "8:00 AM" but `WORKING_HOURS` starts at `09:00` — inconsistency. | 284 |
| m3 | "Same Day Afternoon Available" copy is misleading — minimum booking is 3 days ahead. | 301 |
| m4 | `id: Date.now()` — collision risk if two submissions land within same millisecond. | 164 |
| m5 | `alert()` / `confirm()` break UX consistency and testability. Replace with toast/inline errors. | 184, 200, 211 |
| m6 | `#DAA520` hardcoded 30+ times — should be a CSS variable or Tailwind config value. | throughout |
| m7 | No ARIA labels, no keyboard nav, no focus traps in modals — accessibility gap. | 436–597 |
| m8 | No error boundary — any unhandled exception crashes entire app. | — |
| m9 | Locale `en-US` used for date display but business is Philippine-based (₱ currency). | 196 |

---

## POSITIVE

- Clean morning/afternoon slot logic in `getAvailableSlots()` — intuitive and well-commented.
- Proper form validation — checks all fields, date minimums, Monday exclusion, slot re-checks at submit.
- Defensive submit — re-checks slot availability at submit time (prevents race conditions).
- Responsive design — mobile menu toggle + grid layouts adapt correctly.
- Consistent theming — gold/dark aesthetic maintained throughout.
- Good React patterns — controlled inputs, conditional rendering, state lifting all correct.

---

## Recommended Fix Order

### Before real users touch it
1. Fix timezone-safe date parsing (M1)
2. Add phone/email format validation (M2)
3. Add portfolio delete confirmation (M4)
4. Remove/use unused constants (m1)
5. Fix hours display inconsistency (m2)

### For scale
6. Extract `BookingModal`, `PortfolioModal`, `LoginModal` to own files
7. Extract `useBookingLogic` custom hook
8. Memoize computed values (M6)
9. Replace `alert()`/`confirm()` with toast (m5)

### For production
10. Real auth (NextAuth, Clerk, Supabase)
11. Persistent storage (Supabase / Firebase)
12. Accessibility (ARIA, focus traps)
13. Unit tests for booking logic

---

## Architectural Assessment

Single-file is **acceptable for current MVP scope**. Hard ceiling at ~800 lines — the next significant feature addition (payment, service selection, reviews) requires splitting. Recommend an ADR documenting when the split trigger fires.
