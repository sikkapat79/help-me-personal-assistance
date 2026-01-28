## What is this project?

HelpMe is a Next.js application that acts as an AI personal assistant. It treats **energy as a currency** and helps you prioritize daily tasks based on your current recovery (e.g. rest quality, remaining energy) and task intensity, then produces a short, actionable plan for today.

### Key features
- Morning check-in (bio-calibration) → sets an Energy Budget for the day
- Task intensity scoring: Deep Focus / Routine / Quick Win
- Dynamic capacity tracking: “Fresh / Tired / Taxed” feedback adjusts depletion
- Evening reflection + tomorrow baseline prediction
- AI-assisted prioritization with clear reasoning

### Core pages (planned)
- Today (Dashboard)
- Weekly Plan
- Bio Trends
- Master List
- Calibration

### Non-goals (for now)
- Fully autonomous actions without confirmation
- Calendar write access / automatic scheduling across third-party apps
- Multi-user collaboration workflows

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Tech Stack

- **Framework**: Next.js 16 (App Router) with Turbopack
- **Database**: Neon Postgres with TypeORM
- **AI**: AWS Bedrock (server-side)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

### Database (TypeORM)

This project uses TypeORM with connection pooling for optimal performance:
- Repository pattern for data access
- Connection pool: max 20, min 5 connections
- Migrations managed via TypeORM CLI

**Database scripts:**
```bash
# Run pending migrations
pnpm db:migrate:run

# Generate new migration after entity changes
pnpm db:migration:generate -- lib/db/migrations/MigrationName

# Create empty migration
pnpm db:migration:create
```

See `MIGRATION_GUIDE.md` for details about the MikroORM → TypeORM migration.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

### GitHub Actions → Vercel (Preview + Production)

This repo includes a GitHub Actions workflow at `.github/workflows/vercel.yml` that:
- Deploys **Preview** on pull requests
- Deploys **Production** on pushes to `main`

#### Required GitHub Secrets

Add these in GitHub: **Settings → Secrets and variables → Actions → New repository secret**.
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

#### One-time: link the repo to your Vercel project

Run locally in the repo:

```bash
pnpm dlx vercel link
```

Then copy IDs from `.vercel/project.json`:
- `orgId` → `VERCEL_ORG_ID`
- `projectId` → `VERCEL_PROJECT_ID`

#### App secrets (AWS/DB/etc.)

The GitHub Actions workflow only needs the Vercel deploy secrets above. Your **runtime** secrets (AWS/Bedrock, database URL, etc.) should be set in **Vercel**, not GitHub.

Set these in Vercel: **Project → Settings → Environment Variables** (choose Preview + Production as needed):
- `DATABASE_URL` (Neon Postgres)
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- Any Bedrock/model env vars your app expects (see `lib/env.ts`)

Only add AWS secrets to **GitHub Actions secrets** if your CI steps themselves need AWS access (e.g. integration tests that call Bedrock).
