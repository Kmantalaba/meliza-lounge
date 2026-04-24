# Project Memory — The Meliza Lounge

## Established Facts

- Single JSX file (`meliza-lounge.jsx`) contains the entire application — 607 lines
- Business: nail salon named "The Meliza Lounge"
- Currency: Philippine Peso (₱), starting price ₱799.00
- Business hours: 8 AM–5 PM, closed Mondays
- Booking rule: 3 days minimum advance
- Slot logic: one booking per half-day (morning = before 13:00, afternoon = 13:00+)
- Authentication is email-only — no real security, by design for MVP

## Architectural Decisions

- All state in root component — acceptable for single-file MVP
- No backend — intentional for zero-cost hosting
- In-memory data — known limitation, documented in SETUP_GUIDE.md

## Errors & Fixes

(none yet)

## Session Log

- 2026-04-24: `/init` run. Context files generated. Audit pending.
