import {
  mockChangePassword, mockEvents, mockLogin, mockMyCharacters, mockRankings, mockRegister, mockStatus,
} from './mock';
import {
  ApiError, type AuthResult, type EventSlot, type MyCharacter, type RankingResult, type RankingType,
  type RegisterInput, type SimpleResult, type Status,
} from './types';

export * from './types';

/**
 * Interruptor mock / real. Mock por defecto; para pegarle al backend:
 *   VITE_SITE_MOCK=0 bun run dev:site      (o en el build)
 * `VITE_SITE_API` cambia el prefijo (por defecto `/api`).
 */
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
export const USE_MOCK = env.VITE_SITE_MOCK !== '0';
const BASE = env.VITE_SITE_API ?? '/api';

const TOKEN_KEY = 'argonmu.token';
export const session = {
  get: (): string | null => { try { return sessionStorage.getItem(TOKEN_KEY); } catch { return null; } },
  set: (t: string | null) => { try { t ? sessionStorage.setItem(TOKEN_KEY, t) : sessionStorage.removeItem(TOKEN_KEY); } catch { /* sin storage */ } },
};

async function http<T>(path: string, init?: RequestInit & { json?: unknown }): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  const token = session.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body: string | undefined;
  if (init?.json !== undefined) { headers['Content-Type'] = 'application/json'; body = JSON.stringify(init.json); }
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers, body });
  } catch {
    throw new ApiError('network');
  }
  // 4xx con cuerpo {ok:false,error} es una respuesta válida (ej. «usuario ya existe»).
  const data = (await res.json().catch(() => null)) as T | null;
  if (data === null || (!res.ok && res.status >= 500)) throw new ApiError('badResponse', res.status);
  return data;
}

export const getStatus = (): Promise<Status> => (USE_MOCK ? mockStatus() : http('/status'));
export const getRankings = (tipo: RankingType): Promise<RankingResult> => (USE_MOCK ? mockRankings(tipo) : http(`/rankings/${tipo}`));
export const getEvents = (): Promise<EventSlot[]> => (USE_MOCK ? mockEvents() : http('/events'));
export const register = (input: RegisterInput): Promise<SimpleResult> => (USE_MOCK ? mockRegister(input) : http('/register', { method: 'POST', json: input }));
export const login = (username: string, password: string): Promise<AuthResult> => (USE_MOCK ? mockLogin(username, password) : http('/login', { method: 'POST', json: { username, password } }));
export const getMyCharacters = (): Promise<MyCharacter[]> => (USE_MOCK ? mockMyCharacters() : http('/me/characters'));
export const changePassword = (oldPassword: string, newPassword: string): Promise<SimpleResult> =>
  USE_MOCK ? mockChangePassword() : http('/me/password', { method: 'POST', json: { oldPassword, newPassword } });
