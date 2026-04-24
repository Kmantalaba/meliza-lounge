# Project Stack — The Meliza Lounge

## Frontend
- **React 19** — functional components, hooks only
- **Next.js** — App Router, `'use client'` directive
- **Tailwind CSS v4** — utility classes + inline styles for theme values
- **Lucide React** — icon library (`Calendar`, `Clock`, `MapPin`, `Heart`, `LogOut`, `Plus`, `LogIn`, `User`, `Menu`, `X`, `Image`, `Trash2`, `ChevronLeft`, `ChevronRight`)

## Language
- JavaScript (JSX) — no TypeScript currently

## State Management
- React `useState` — all state in single root component
- No external state library (Redux, Zustand, Jotai, etc.)

## Data Persistence
- In-memory only (browser refresh resets all data)
- No database, no localStorage, no backend

## Auth
- Email-only login — no password, no session tokens, no JWT
- No auth library (Firebase, Clerk, NextAuth, etc.)

## Hosting (recommended per SETUP_GUIDE)
- Vercel (free tier)

## Dev Environment
- VS Code with Chrome debugger (`localhost:8080`)

## Dependencies (inferred)
- `react`
- `react-dom`
- `next`
- `lucide-react`
- `tailwindcss`
