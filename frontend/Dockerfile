# ── deps: install all dependencies for build ─────────────────────────────────
FROM node:20.19.1-alpine3.21 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── builder: Next.js standalone build ────────────────────────────────────────
FROM node:20.19.1-alpine3.21 AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── runner: minimal production image ─────────────────────────────────────────
FROM node:20.19.1-alpine3.21 AS runner
WORKDIR /app
ENV NODE_ENV=production

# Non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder --chown=appuser:appgroup /app/.next/standalone ./
COPY --from=builder --chown=appuser:appgroup /app/.next/static ./.next/static
COPY --from=builder --chown=appuser:appgroup /app/public ./public

USER appuser
EXPOSE 3000
CMD ["node", "server.js"]
