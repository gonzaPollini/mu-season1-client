/** Contrato de la API pública. Ver `site/API.md`. */

export type ServerInfo = { id: string; name: string; players: number; max: number; pvp: boolean };

export type Status = {
  online: boolean;
  version: string;
  /** Hora del server, ISO 8601 UTC. */
  time: string;
  exp: number;
  totalPlayers: number;
  servers: ServerInfo[];
};

export type RankingType = 'resets' | 'level' | 'killers' | 'guilds';

export type CharRow = {
  rank: number;
  name: string;
  class: string;
  resets: number;
  level: number;
  /** Kills PvP (sólo en el ranking `killers`). */
  kills?: number;
  guild: string | null;
  online: boolean;
};

export type GuildRow = { rank: number; name: string; score: number; members: number; master: string };

export type RankingResult =
  | { type: 'resets' | 'level' | 'killers'; rows: CharRow[]; updatedAt: string }
  | { type: 'guilds'; rows: GuildRow[]; updatedAt: string };

export type EventSlot = {
  id: string;
  name: string;
  desc: string;
  /** Próximas ocurrencias, ISO 8601 UTC, ordenadas. */
  next: string[];
};

export type RegisterInput = { username: string; password: string; email: string };
/** En `ok:false`, `error` es un CÓDIGO (userExists, badCredentials, ...), no una frase: la UI lo traduce. */
export type AuthResult = { ok: true; token: string; username: string } | { ok: false; error: string };
export type SimpleResult = { ok: true } | { ok: false; error: string };

export type MyCharacter = { name: string; class: string; level: number; resets: number; guild: string | null; online: boolean };

/** Falla de red o respuesta no válida: la UI muestra «no pudimos conectar». */
export class ApiError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}
