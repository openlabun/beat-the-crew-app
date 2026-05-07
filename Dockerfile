# =========================
# Builder stage
# =========================
FROM node:lts-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

# Prisma generate if needed
RUN npx prisma generate

# Build app
RUN pnpm run build


# =========================
# Development stage
# =========================
FROM node:lts-alpine AS development

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

# Source usually mounted via docker compose
COPY . .

EXPOSE 3000

CMD ["pnpm", "run", "start:dev"]


# =========================
# Production stage
# =========================
FROM node:lts-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV HUSKY=0

RUN apk add --no-cache dumb-init openssl && \
    npm install -g pnpm prisma

COPY package.json pnpm-lock.yaml ./

RUN npm pkg delete scripts.prepare && \
    pnpm install --prod --frozen-lockfile

# Prisma stuff
COPY prisma ./prisma

RUN prisma generate

# Built app
COPY --from=builder /app/dist ./dist

# Optional: static/public assets
# COPY --from=builder /app/public ./public

RUN addgroup -S nodejs && \
    adduser -S nestjs -G nodejs

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["dumb-init", "node", "dist/main"]