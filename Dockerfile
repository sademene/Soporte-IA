# --- Builder ---
FROM node:20-slim AS builder
WORKDIR /app

ENV CI=true \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Copiamos manifest + scripts antes para cache
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
COPY scripts ./scripts

# Instalar dependencias con reintentos
RUN set -eux; \
    attempts=5; \
    for i in $(seq 1 $attempts); do \
      if [ -f package-lock.json ]; then npm ci && break || true; \
      elif [ -f yarn.lock ]; then corepack enable && yarn install --frozen-lockfile && break || true; \
      elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile && break || true; \
      else npm i && break || true; \
      fi; \
      echo "Fallo instalando deps, reintento ${i}/${attempts}..."; \
      sleep $((i*5)); \
      if [ "$i" = "$attempts" ]; then exit 1; fi; \
    done

# Asegura bcryptjs (evita binarios nativos)
RUN npm i bcryptjs --no-save

# Copia resto y build Next (standalone)
COPY . .
RUN npm run build

# --- Runtime ---
FROM node:20-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

# Carpeta de datos SQLite
RUN mkdir -p /app/data

# Copiamos solo lo necesario para standalone
COPY --from=builder /app/.next/standalone /app
COPY --from=builder /app/.next/static /app/.next/static
COPY --from=builder /app/public /app/public

EXPOSE 3000
CMD ["node", "server.js"]
