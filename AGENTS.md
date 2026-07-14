<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Gold POS is a single Next.js 16 (App Router) point-of-sale app for a gold/jewelry shop. Data is persisted in a local SQLite file (`prisma/dev.db`) via Prisma. There is one service to run: the Next.js dev server.

Standard commands live in `package.json` scripts (`dev`, `build`, `lint`, `db:setup`, `db:seed`). Non-obvious caveats for this repo:

- **Database must be initialized before the app is useful.** `prisma/dev.db` is git-ignored, so it will not exist on a fresh checkout. Run `npm run db:setup` (which runs `prisma db push` + seed) once before starting the dev server, otherwise pages/API routes that query the DB throw at request time (the server still boots). This step is intentionally NOT in the startup update script because it is a migration/data step.
- **Prisma is pinned to v6**, not the latest v7. v7 removed the `datasource url` field in favor of `prisma.config.ts` + driver adapters. Keep it on `^6` unless you migrate the whole Prisma setup.
- `npm install` runs `prisma generate` via a `postinstall` hook, so the Prisma client is regenerated automatically after installs; you do not need to run it manually.
- `DATABASE_URL` lives in `.env.example` (`file:./dev.db`). Copy to `.env` locally (`cp .env.example .env`). The relative SQLite path resolves to `prisma/dev.db` for both the Prisma CLI and the runtime client — do not "fix" it to a root-level path.
- `npm run db:reset` uses `prisma db push --force-reset`, which Prisma blocks for AI agents without explicit consent. To clear sales during testing without a destructive reset, delete `SaleItem`/`Sale` rows via a small Prisma script and re-run `npm run db:seed` to restore product stock.
- Money is stored as integer cents (`priceCents`, `totalCents`); weights are grams. Format for display with helpers in `src/lib/format.ts`.
