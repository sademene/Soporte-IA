# Soporte-IA (Chat de Soporte IA)

## Arranque rápido
1) Copia `.env.example` a `.env` y revisa `SESSION_SECRET` (32+ chars).  
2) `docker compose up -d --build`  
3) Abre http://localhost:1230/login  
4) Credenciales superadmin (desde `.env`): `admin / admin`  
5) Prueba: nueva conversación → enviar mensaje → nueva → historial → exportar → cambiar tema/branding → logout.

## Notas
- Build Next.js en modo `standalone` y el contenedor ejecuta `node .next/standalone/server.js`.
- BD SQLite en `/app/data/frontend.db` (volumen). `scripts/init-db.js` es idempotente.
- El proxy `/api/proxy/query` llama a `${API_BASE_URL}/query` (sin streaming). Si `USE_API_MOCK=true`, usa mock interno.
- El historial de chat es local por usuario con `localStorage` (no se guardan conversaciones vacías).
- Branding y tema se aplican globalmente y se guardan en BD y `cookies` para efecto inmediato.
