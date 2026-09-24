import { invoke, isTauri } from '@tauri-apps/api/core';
import type { AuthTokens } from '../api/types';

// Токены по узлам.
// Приложение (Tauri): системный keychain через Rust-команды (src-tauri/src/secrets.rs).
// Веб: localStorage — вход переживает перезагрузку страницы. От чужих скриптов защищает
// строгий CSP в nginx: страница может ходить только на свой узел (docker/nginx.conf).
const key = (host: string) => `privy.tokens:${host}`;

const web = {
  get(host: string): AuthTokens | null {
    try {
      const raw = localStorage.getItem(key(host));
      return raw ? (JSON.parse(raw) as AuthTokens) : null;
    } catch {
      return null;
    }
  },
  set(host: string, tokens: AuthTokens) {
    localStorage.setItem(key(host), JSON.stringify(tokens));
  },
  remove(host: string) {
    localStorage.removeItem(key(host));
  },
};

export const secrets = {
  async get(host: string): Promise<AuthTokens | null> {
    if (!isTauri()) return web.get(host);
    return invoke<AuthTokens | null>('tokens_get', { host });
  },
  async set(host: string, tokens: AuthTokens): Promise<void> {
    if (!isTauri()) return web.set(host, tokens);
    await invoke('tokens_set', { host, tokens });
  },
  async remove(host: string): Promise<void> {
    if (!isTauri()) return web.remove(host);
    await invoke('tokens_delete', { host });
  },
};
