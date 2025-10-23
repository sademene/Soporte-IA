# --- Builder stage ---
FROM node:20-slim AS builder

WORKDIR /app

# System deps needed to compile native modules like better-sqlite3
RUN apt-get update && apt-get install -y --no-install-recommends     python3 make g++  && rm -rf /var/lib/apt/lists/*

# Copy manifests first to leverage cache
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
COPY scripts ./scripts

# Install dependencies (ignore scripts at this point to avoid DB init during build)
RUN if [ -f package-lock.json ]; then npm ci --ignore-scripts;     elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile --ignore-scripts;     elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile --ignore-scripts;     else npm i --ignore-scripts; fi

# Copy the rest of the source and build Next.js (standalone)
COPY . .

# Ensure Next builds a standalone server output
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# --- Runtime stage ---
FROM node:20-slim AS runtime

WORKDIR /app

# Optional: tini for proper signal handling (not strictly required)
# RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*

# Create data dir for sqlite
RUN mkdir -p /app/data

# Copy production build output
COPY --from=builder /app/.next/standalone ./.next/standalone
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts ./scripts

# Environment needed by Next
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# Initialize the DB on container start (non-fatal if it fails)
# and then start the Next standalone server
CMD node ./scripts/init-db.js || true && node .next/standalone/server.js
