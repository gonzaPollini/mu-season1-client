# API pública de ARGONMU ONLINE (contrato para la etapa 2)

El frontend (`site/src/api/index.ts`) hoy devuelve datos mock. Para usar el backend real:
`VITE_SITE_MOCK=0` (y opcionalmente `VITE_SITE_API=/api`, el prefijo por defecto). Tipos en `site/src/api/types.ts`.

Reglas generales
- JSON, UTF-8. Fechas en ISO 8601 UTC. Lectura pública con `Cache-Control: public, max-age=60`.
- Errores de negocio (usuario repetido, clave mala): HTTP 200/400/401/409 con `{"ok":false,"error":"<código>"}`. `error` es un CÓDIGO (no una frase) que el front traduce a es/en/pt: `userExists`, `badCredentials`, `badOldPassword`, `playerOnline`, `rateLimited`. Un código desconocido muestra un mensaje genérico.
- 5xx o cuerpo no-JSON: el front muestra «no pudimos conectar».
- Rutas autenticadas: `Authorization: Bearer <token>` (el front lo guarda en `sessionStorage`).
- Nunca devolver `LoginName` en rankings, sólo nombre de personaje. Excluir GMs (`State=2`), baneados y bots.

## GET /api/status
```json
{ "online": true, "version": "0.9.10", "time": "2026-10-16T15:00:00Z", "exp": 250, "totalPlayers": 746,
  "servers": [ { "id": "s1", "name": "ARGONMU", "players": 412, "max": 1000, "pvp": true } ] }
```
`servers` es una lista (hoy un solo server; el front soporta varios).
Fuente: `/api/status` de OpenMU o presence del proxy.

## GET /api/rankings/:tipo   (`resets` | `level` | `killers` | `guilds`)
Hasta 100 filas, ya ordenadas; el front busca y pagina en el navegador.
```json
{ "type": "resets", "updatedAt": "2026-10-16T14:56:00Z",
  "rows": [ { "rank": 1, "name": "Aldaris", "class": "Grand Master", "resets": 120, "level": 400, "guild": "Argon", "online": true } ] }
```
- `killers`: cada fila lleva además `"kills": 523` (requiere tabla propia de kills, ver `web-mu.md` §2.5).
- `guilds`: `"rows": [ { "rank": 1, "name": "Legión", "score": 90000, "members": 24, "master": "Kaelthas" } ]`

## GET /api/events
Próximas ocurrencias (hasta 3) por evento, ISO UTC, ordenadas. El server calcula con hora de Argentina (UTC-3, sin DST).
```json
[ { "id": "bc", "name": "Blood Castle", "desc": "…", "next": ["2026-10-16T16:00:00Z", "2026-10-16T19:00:00Z"] } ]
```
Ids usados hoy: `bc`, `ds`, `cc`, `golden`, `cs`.

## POST /api/register
Body: `{ "username": "gonza", "password": "abcd", "email": "a@b.com" }`
Validar de nuevo con `validateSignup` (`src/modules/servers/registerRules.ts`), usuario 4-10 alfanumérico, clave 4-10 ASCII imprimible; email válido; rate limit por IP.
Respuesta: `{ "ok": true }` o `{ "ok": false, "error": "userExists" }`.
(Ya existe `register/server/main.ts`; la etapa 2 puede unificarlo bajo este prefijo.)

## POST /api/login
Body: `{ "username": "gonza", "password": "abcd" }`
Respuesta: `{ "ok": true, "token": "…", "username": "gonza" }` o `{ "ok": false, "error": "badCredentials" }`. Rate limit y bloqueo temporal por intentos.

## GET /api/me/characters   (auth)
```json
[ { "name": "Aldaris", "class": "Grand Master", "level": 387, "resets": 42, "guild": "Argon", "online": true } ]
```
401 si el token no sirve.

## POST /api/me/password   (auth)
Body: `{ "oldPassword": "…", "newPassword": "…" }` -> `{ "ok": true }` o `{ "ok": false, "error": "<código>" }`.
Sólo con la cuenta desconectada (presence + `is-online`); responder `{"ok":false,"error":"playerOnline"}` si está online.

## GET /api/coins/packs
Paquetes de MU Coins a la venta (público). Precio en pesos argentinos (entero). Los de `data/coins.ts` son sólo de ejemplo.
```json
[ { "id": "p2500", "coins": 2500, "bonus": 150, "priceArs": 10000 } ]
```

## GET /api/me/coins   (auth)
`{ "balance": 1250 }` — saldo actual de MU Coins de la cuenta (se usan sólo dentro del juego, en un NPC; no dan ventajas de poder).

## POST /api/me/coins/orders   (auth)
Body: `{ "packId": "p2500" }`
El backend crea la preferencia de Mercado Pago y devuelve su `init_point`; el front redirige ahí. El acreditado lo hace el **webhook** de Mercado Pago (verificar firma y monto, idempotente por `payment id`), nunca el front.
Respuesta: `{ "ok": true, "checkoutUrl": "https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=…" }` o `{ "ok": false, "error": "<código>" }`.
Códigos nuevos: `paymentsDisabled` (el mock siempre lo devuelve: no redirige a ningún lado).
