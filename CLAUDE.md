# The Meliza Lounge — Project Conventions

## Stack
- React 19 + Next.js (App Router, `'use client'`)
- Tailwind CSS v4 + inline styles (gold `#DAA520` / dark `#1a1a1a` theme)
- Lucide React icons
- Single-file component: `meliza-lounge.jsx`

## Conventions
- All state lives in the root `MelizaLounge` component (no external state lib)
- Colors: gold `#DAA520`, dark bg `#1a1a1a`/`#2d2d2d`, accent red `#ff6b6b`, green `#4ade80`
- Inline styles for one-off values; Tailwind utility classes for layout/spacing/responsive
- No backend: state is in-memory (browser refresh resets it)
- No real auth: login is email-only, no password validation
- Booking logic: 3-day advance, closed Mondays, morning/afternoon slot split

## File Structure
```
meliza-lounge.jsx   # Entire application
SETUP_GUIDE.md      # Deployment and customization guide
DEPLOYMENT_STEPS.md # Deployment steps
QUICK_REFERENCE.txt # Quick reference
.vscode/launch.json # Chrome debugger config
```

## Known Limitations (by design)
- Appointments reset on page refresh — no database
- No email notifications — UI-only
- Admin vs customer not differentiated by role — any email can login
