import { create } from 'zustand';
import { nodeApi, setAuthExpiredHandler, type AuthTokens } from '../api';
import { secrets } from '../platform/secrets';

interface SessionState {
  /** host, на котором открыта сессия; null — показать экран входа */
  host: string | null;
  restoring: boolean;
  signIn: (host: string, tokens: AuthTokens) => Promise<void>;
  /** Выход: инвалидировать refresh на узле и стереть токены. */
  signOut: () => Promise<void>;
  /**
   * Сделать узел текущим. Аккаунты у каждого узла свои: если токенов для него
   * нет, открывается экран входа. Возвращает true, если сессия есть.
   */
  activate: (host: string) => Promise<boolean>;
  /** При запуске: есть ли в keychain токены для узла. */
  restore: (host: string | null) => Promise<void>;
}

export const useSession = create<SessionState>()((set, get) => ({
  host: null,
  restoring: true,

  async signIn(host, tokens) {
    await secrets.set(host, tokens);
    set({ host });
  },

  async signOut() {
    const { host } = get();
    set({ host: null });
    if (!host) return;
    const tokens = await secrets.get(host).catch(() => null);
    await secrets.remove(host);
    // Best effort: локально сессия закрыта в любом случае.
    if (tokens) await nodeApi.logout(host, tokens).catch(() => {});
  },

  async activate(host) {
    const tokens = await secrets.get(host).catch(() => null);
    set({ host: tokens ? host : null });
    return !!tokens;
  },

  async restore(host) {
    if (!host) return set({ host: null, restoring: false });
    try {
      const tokens = await secrets.get(host);
      set({ host: tokens ? host : null, restoring: false });
    } catch {
      set({ host: null, restoring: false });
    }
  },
}));

// Refresh-токен отклонён узлом — сессия на нём закончилась, нужен повторный вход.
setAuthExpiredHandler((host) => {
  if (useSession.getState().host === host) useSession.setState({ host: null });
});
