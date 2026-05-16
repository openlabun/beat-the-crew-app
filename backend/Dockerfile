FROM node:lts-alpine AS development
WORKDIR /app

RUN npm install -g pnpm && \
    pnpm config set store-dir /home/node/.pnpm-store

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install

COPY --chown=node:node . .

RUN pnpm exec prisma generate
RUN chown -R node:node /app

USER node

EXPOSE 3000

FROM development AS builder
RUN pnpm run build

FROM node:lts-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache dumb-init openssl && \
    npm install -g pnpm && \
    pnpm config set store-dir /root/.pnpm-store

COPY --chown=node:node package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --chown=node:node prisma ./prisma
RUN pnpm exec prisma generate

COPY --chown=node:node . .

COPY --chown=node:node --from=builder /app/dist ./dist

RUN addgroup -S nodejs && \
    adduser -S nestjs -G nodejs && \
    chown -R nestjs:nodejs /app

USER nestjs

EXPOSE 3000

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x entrypoint.sh
CMD ["./entrypoint.sh"]
