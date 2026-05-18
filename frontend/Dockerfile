# =========================
# Builder stage
# =========================
FROM node:lts-alpine AS builder
WORKDIR /app

ENV CI=true
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npm install -g pnpm && \
    pnpm config set store-dir /root/.pnpm-store

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build the Next.js app
RUN pnpm run build

# =========================
# Production stage
# =========================
FROM node:lts-alpine AS production
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

ENV NODE_ENV=production

RUN npm install -g pnpm && \
    pnpm config set store-dir /root/.pnpm-store

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN addgroup -S nodejs && \
    adduser -S nextjs -G nodejs && \
    chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3001

CMD ["node", "server.js"]

# =========================
# Development stage
# =========================
FROM node:lts-alpine AS development
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm install -g pnpm && \
    pnpm config set store-dir /home/node/.pnpm-store

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./

RUN pnpm install

COPY --chown=node:node . .

RUN chown -R node:node /app 

USER node

EXPOSE 3001

CMD ["pnpm", "run", "dev"]
