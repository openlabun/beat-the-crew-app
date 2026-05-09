# =========================
# Builder stage
# =========================
FROM node:lts-alpine AS builder
WORKDIR /app

RUN npm install -g pnpm && \
    pnpm config set store-dir /root/.pnpm-store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm exec prisma generate
RUN pnpm run build

# =========================
# Development stage
# =========================
FROM node:lts-alpine AS development
WORKDIR /app

RUN npm install -g pnpm && \
    pnpm config set store-dir /root/.pnpm-store

# Copy node_modules from builder — no pnpm install needed here
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --from=builder /app/node_modules ./node_modules

RUN chown -R node:node /app/node_modules && \
    mkdir -p dist && \
    chown -R node:node /app/dist

USER node

EXPOSE 3000

# =========================
# Production stage
# =========================
FROM node:lts-alpine AS production
WORKDIR /app

ENV NODE_ENV=production
ENV HUSKY=0

RUN apk add --no-cache dumb-init openssl && \
    npm install -g pnpm prisma && \
    pnpm config set store-dir /root/.pnpm-store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN npm pkg delete scripts.prepare && \
    pnpm install --prod --frozen-lockfile

COPY prisma ./prisma
RUN prisma generate

COPY --from=builder /app/dist ./dist

RUN addgroup -S nodejs && \
    adduser -S nestjs -G nodejs && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["dumb-init", "node", "dist/main"]