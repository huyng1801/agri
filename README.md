# agri

Agri Passport is a mobile-first SaaS platform for cooperatives, farmers, product traceability, QR passports, subscription management and operational reporting.

## Stack

- Frontend: Next.js App Router, TypeScript, Tailwind CSS, React Hook Form, Zod, TanStack Query, PWA-ready.
- Backend: NestJS, TypeScript, Prisma, PostgreSQL, Redis, JWT auth, RBAC, Swagger, DTO validation.
- Deploy: Docker Compose, Nginx reverse proxy, PostgreSQL, Redis, automated backup scripts.

## Local setup

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run typecheck
npm run test
```

For database-backed development, run PostgreSQL and Redis, then:

```bash
cd backend
npx prisma migrate dev
npm run seed:prod
npm run start:dev
```

In another terminal:

```bash
cd frontend
npm run dev
```

## Production

```bash
cp .env.production.example .env.production
docker compose -f docker-compose.prod.yml up -d --build
docker exec agri_backend npm run seed:prod
./scripts/smoke.sh
```

Default URLs:

- Web: `http://14.225.206.91`
- API health: `http://14.225.206.91/health`
- Swagger: `http://14.225.206.91/api/docs`

Replace all `CHANGE_ME` values before public production use.
