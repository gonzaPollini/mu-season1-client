import { EVENTS } from '../data/events';
import { nextOccurrences } from '../lib/time';
import type {
  AuthResult, CharRow, EventSlot, GuildRow, MyCharacter, RankingResult, RankingType,
  RegisterInput, SimpleResult, Status,
} from './types';

/** Datos de mentira, deterministas, para trabajar el diseño sin backend. */

const wait = (ms = 350) => new Promise<void>((r) => setTimeout(r, ms));

/** PRNG con semilla (mulberry32): mismos datos en cada recarga. */
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CLASES = ['Grand Master', 'Blade Master', 'High Elf', 'Duel Master', 'Lord Emperor', 'Dimension Master', 'Fist Master', 'Soul Master', 'Blade Knight', 'Muse Elf'];
const NOMBRES = ['Aldaris', 'Kaelthas', 'Nyxara', 'Drakon', 'Selene', 'Morgrim', 'Vexil', 'Astrael', 'Zephyra', 'Thorn', 'Lyria', 'Baldur', 'Ignis', 'Orion', 'Valkyr', 'Ember', 'Sylas', 'Rhea', 'Karnak', 'Mirage'];
const GUILDS = ['Legión', 'Ónix', 'Fénix', 'Argon', 'Sombra', null, null, 'Crono'];

function chars(): CharRow[] {
  const r = rng(1337);
  return Array.from({ length: 120 }, (_, i) => {
    const base = NOMBRES[i % NOMBRES.length]!;
    return {
      rank: 0,
      name: `${base}${i >= NOMBRES.length ? Math.floor(r() * 99) : ''}`,
      class: CLASES[Math.floor(r() * CLASES.length)]!,
      resets: Math.floor(r() * r() * 160),
      level: 1 + Math.floor(r() * 400),
      kills: Math.floor(r() * r() * 900),
      guild: GUILDS[Math.floor(r() * GUILDS.length)] ?? null,
      online: r() < 0.3,
    };
  });
}

const sorted = (key: (c: CharRow) => number): CharRow[] =>
  chars().sort((a, b) => key(b) - key(a) || b.level - a.level).slice(0, 100).map((c, i) => ({ ...c, rank: i + 1 }));

export async function mockStatus(): Promise<Status> {
  await wait(250);
  const servers = [{ id: 's1', name: 'ARGONMU', players: 412, max: 1000, pvp: true }];
  return {
    online: true, version: '0.9.10', time: new Date().toISOString(), exp: 250,
    totalPlayers: servers.reduce((a, s) => a + s.players, 0), servers,
  };
}

export async function mockRankings(type: RankingType): Promise<RankingResult> {
  await wait();
  const updatedAt = new Date(Date.now() - 4 * 60_000).toISOString();
  if (type === 'guilds') {
    const r = rng(7);
    const rows: GuildRow[] = ['Legión', 'Ónix', 'Fénix', 'Argon', 'Sombra', 'Crono', 'Aurora', 'Nébula', 'Eclipse', 'Titán', 'Cenit', 'Vórtice']
      .map((name, i) => ({ rank: 0, name, score: Math.floor((12 - i) * 9000 * (0.7 + r() * 0.6)), members: 8 + Math.floor(r() * 32), master: NOMBRES[i]! }))
      .sort((a, b) => b.score - a.score).map((g, i) => ({ ...g, rank: i + 1 }));
    return { type, rows, updatedAt };
  }
  const rows = type === 'resets' ? sorted((c) => c.resets * 1000 + c.level)
    : type === 'level' ? sorted((c) => c.level)
    : sorted((c) => c.kills ?? 0);
  return { type, rows, updatedAt };
}

export async function mockEvents(): Promise<EventSlot[]> {
  await wait(150);
  return EVENTS.map((e) => ({ id: e.id, name: e.name, desc: e.desc, next: nextOccurrences(e, 3).map((d) => d.toISOString()) }));
}

export async function mockRegister(input: RegisterInput): Promise<SimpleResult> {
  await wait(700);
  if (input.username.toLowerCase() === 'admin') return { ok: false, error: 'userExists' };
  return { ok: true };
}

export async function mockLogin(username: string, password: string): Promise<AuthResult> {
  await wait(600);
  if (password === 'mal') return { ok: false, error: 'badCredentials' };
  return { ok: true, token: 'mock-token', username };
}

export async function mockChangePassword(): Promise<SimpleResult> {
  await wait(600);
  return { ok: true };
}

export async function mockMyCharacters(): Promise<MyCharacter[]> {
  await wait(400);
  return [
    { name: 'Aldaris', class: 'Grand Master', level: 387, resets: 42, guild: 'Argon', online: true },
    { name: 'Nyxara', class: 'High Elf', level: 120, resets: 7, guild: null, online: false },
    { name: 'Thorn', class: 'Blade Master', level: 15, resets: 0, guild: null, online: false },
  ];
}
