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
