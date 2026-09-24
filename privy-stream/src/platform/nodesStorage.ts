import { isTauri } from '@tauri-apps/api/core';
import type { Store } from '@tauri-apps/plugin-store';
import { createJSONStorage, type PersistStorage, type StorageValue } from 'zustand/middleware';
import { IS_WEB } from './mode';

// Где живёт список узлов:
// - приложение (Tauri): nodes.json в app data dir
//   (macOS: ~/Library/Application Support/stream.privy.client/nodes.json).
//   Общий для dev- и релизной сборки, в отличие от localStorage webview;
// - веб: нигде — единственный узел каждый раз берётся из config.json;
// - браузер в режиме app (разработка): localStorage.

const FILE = 'nodes.json';

let store: Promise<Store> | null = null;
const fileStore = () =>
  (store ??= import('@tauri-apps/plugin-store').then(({ load }) => load(FILE, { autoSave: false, defaults: {} })));

function fileStorage<S>(): PersistStorage<S> {
  return {
    async getItem(name) {
      const s = await fileStore();
      const value = await s.get<StorageValue<S>>(name);
      if (value != null) return value;
      // Версии до файлового хранилища держали список в localStorage webview — переносим один раз.
      const legacy = localStorage.getItem(name);
      if (legacy == null) return null;
      const parsed = JSON.parse(legacy) as StorageValue<S>;
      await s.set(name, parsed);
      await s.save();
      localStorage.removeItem(name);
      return parsed;
    },
    async setItem(name, value) {
      const s = await fileStore();
      await s.set(name, value);
      await s.save();
    },
    async removeItem(name) {
      const s = await fileStore();
      await s.delete(name);
      await s.save();
    },
  };
}

const noStorage: PersistStorage<unknown> = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export function nodesStorage<S>(): PersistStorage<S> | undefined {
  if (IS_WEB) return noStorage as PersistStorage<S>;
  if (isTauri()) return fileStorage<S>();
  return createJSONStorage<S>(() => localStorage);
}
