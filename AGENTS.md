# AGENTS.md

## Cursor Cloud specific instructions

### Architecture

This is an LLM API unified proxy platform with two packages:
- **`server/`** — Express + TypeScript backend (port 3000). Uses Prisma ORM with SQLite for dev.
- **`client/`** — React + Vite frontend (port 5173). Proxies `/api` to backend via Vite dev server.

### Running Services

- **Backend**: `cd server && npm run dev` (uses `tsx watch`, hot-reloads on file changes)
- **Frontend**: `cd client && npm run dev` (Vite dev server with HMR)
- See `README.md` for full setup and API usage examples.

### Database

- Dev uses SQLite at `server/prisma/dev.db`. If the DB file is missing or schema changed, run:
  ```
  cd server && npx prisma migrate dev && npm run seed
  ```
- Seed data creates two test accounts: `admin@example.com` / `admin123` (admin), `test@example.com` / `test123` (user).

### Known Issues

- **ESLint**: Both packages declare ESLint 9 as a dependency but have no `eslint.config.js` files. `npm run lint` will fail until flat configs are added.
- **TypeScript**: Server has pre-existing type errors (SDK type mismatches in `llmProvider.ts`, `apiKey.ts`, `proxy.ts`). The dev server uses `tsx` which bypasses type checking, so runtime is unaffected.
- **Vitest**: Configured in server `package.json` but no test files exist. `npm run test` exits with code 1 (no tests found).
- **Redis**: Listed in dependencies (`ioredis`) but optional for dev. The server starts without Redis.

### Update Script (Cloud Warmup)

The VM startup update script handles:
1. `npm install` for both `server/` and `client/`
2. `.env` creation from `.env.example` (if missing)
3. `npx prisma generate` — caches the Prisma Client into `server/node_modules/.prisma/client/`
4. `npx prisma migrate deploy` — applies pending migrations non-interactively (falls back to `migrate dev` for fresh databases)

After the update script runs, services are ready to start immediately without additional setup.

### Integration Tests

The repo includes `test.sh` (curl-based smoke tests against the running backend). Run it after starting the backend:
```
./test.sh
```
Requires `jq` to be installed for JSON formatting.
