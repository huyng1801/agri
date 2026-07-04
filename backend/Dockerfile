FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache openssl
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
RUN npm ci --workspace backend

FROM node:22-alpine AS builder
WORKDIR /app/backend
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
COPY backend .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl postgresql-client gzip
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
RUN npm ci --omit=dev --workspace backend
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/node_modules/.prisma ./node_modules/.prisma
WORKDIR /app/backend
EXPOSE 3001
CMD ["node", "dist/src/main.js"]
