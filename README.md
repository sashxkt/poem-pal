# Poem Pal

A small black notebook on the web.

A place where you write one poem, release it into the dark, receive one in return, leave a closing word, and step away.
No endless thread. No profile theater. No performance loop.
Just one exchange, one breath, one ending.

## The Idea

Poem Pal is built around a daily ritual:

1. Write a poem.
2. Send it into the wind.
3. Receive a stranger's poem.
4. Leave a brief word of closure.
5. Be done for the day.

It is intentionally minimal.
The product does not try to keep you scrolling.
It tries to give you a finished feeling.

## Visual Language

- Ink-on-dark-paper aesthetic
- Black, deep gray, off-white palette
- One warm accent (`#E8D5B0`) for meaningful interaction
- Serif for poems (`Cormorant Garamond`)
- Monospace for UI whispers (`DM Mono`)

## Core Flow

- `/login` and `/register`: quiet entry points
- `/write`: today's poem
- `/read`: poem delivered to you + short closing word
- `/done`: resting state
- `/inbox`: words others left on your poems (anonymous)

Root (`/`) routes users to the correct state based on auth + today's progress.

## Matching Philosophy

Daily matching is fair and anonymous:

- Only poems from **today (UTC)** are considered
- Never your own poem
- Never the same poem delivered twice to you
- Candidate with the fewest deliveries is favored
- Ties are randomized

This keeps the exchange balanced without exposing identities.

## Tech Stack

- Next.js (App Router, TypeScript)
- NextAuth (Credentials + JWT sessions)
- Prisma + PostgreSQL
- Zod validation
- Framer Motion (subtle fade transitions)

## Quick Start

```bash
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Create `.env`:

```env
DATABASE_URL="your_postgres_or_prisma_accelerate_url"
NEXTAUTH_SECRET="your_long_random_secret"
NEXTAUTH_URL="http://localhost:3000"
```

For production on Vercel:

- `NEXTAUTH_URL` must be your public domain (for example `https://your-domain.com`)
- Set env vars in Vercel Project Settings
- Redeploy after updating variables

## API Routes

- `POST /api/poems/submit`
- `GET /api/poems/today`
- `POST /api/poems/comment`
- `GET /api/poems/inbox`
- `POST /api/auth/register`
- `GET/POST /api/auth/[...nextauth]`

## Project Structure

```text
prisma/
  schema.prisma
src/
  app/
    (auth)/
    (app)/
    api/
  components/
  lib/
  types/
```

## Closing Note

Poem Pal is not trying to be the loudest room.
It is a soft ritual for people who still believe a few lines can carry weight.

Write.
Release.
Receive.
Close.
