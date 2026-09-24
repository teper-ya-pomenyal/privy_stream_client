import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track } from '../api';

interface PlayerState {
  queue: Track[];
  index: number;
  playing: boolean;
  /** Позиция в текущем треке, сек. */
  position: number;
  /** Растёт при каждом seek — AudioEngine по нему переставляет <audio>. */
  seekNonce: number;
  /** Растёт при каждом новом проигрывании (play/next/prev), в том числе того же трека. */
  playId: number;
  fullscreen: boolean;
  /** Длительность из метаданных файла; 0 — не известна, берётся из трека. */
  mediaDuration: number;
  /** Трек скачивается с узла */
  loading: boolean;
  /** Ошибка стрима в формате «код · сообщение» */
  error: string;

  setQueue: (queue: Track[]) => void;
  /** Начать трек; если передан список — он становится очередью. */
  play: (track: Track, list?: Track[]) => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (fraction: number) => void;
  tick: (position: number) => void;
  setMedia: (patch: Partial<Pick<PlayerState, 'mediaDuration' | 'loading' | 'error' | 'playing'>>) => void;
  setFullscreen: (open: boolean) => void;
}

export const usePlayer = create<PlayerState>()(
  persist(
    (set, get) => ({
      queue: [],
      index: 0,
      playing: false,
      position: 0,
      seekNonce: 0,
      playId: 0,
      fullscreen: false,
      mediaDuration: 0,
      loading: false,
      error: '',

      setQueue: (queue) => set({ queue, index: 0, position: 0 }),

      play(track, list) {
        const queue = list ?? get().queue;
        let index = queue.findIndex((t) => t.id === track.id);
        const nextQueue = index === -1 ? [...queue, track] : queue;
        if (index === -1) index = nextQueue.length - 1;
        set((s) => ({ queue: nextQueue, index, position: 0, playing: true, seekNonce: s.seekNonce + 1, playId: s.playId + 1 }));
      },

      toggle: () => set((s) => ({ playing: s.queue.length > 0 && !s.playing })),

      next: () =>
        set((s) => ({
          index: s.queue.length ? (s.index + 1) % s.queue.length : 0,
          position: 0,
          playing: s.queue.length > 0,
          seekNonce: s.seekNonce + 1,
          playId: s.playId + 1,
        })),

      prev: () =>
        set((s) => ({
          index: s.queue.length ? (s.index - 1 + s.queue.length) % s.queue.length : 0,
          position: 0,
          playing: s.queue.length > 0,
          seekNonce: s.seekNonce + 1,
          playId: s.playId + 1,
        })),

      seek(fraction) {
        const track = get().queue[get().index];
        if (!track) return;
        const f = Math.max(0, Math.min(1, fraction));
        set((s) => ({ position: f * (s.mediaDuration || track.durationSec), seekNonce: s.seekNonce + 1 }));
      },

      tick: (position) => set({ position }),

      setMedia: (patch) => set(patch),

      setFullscreen: (fullscreen) => set({ fullscreen }),
    }),
    {
      name: 'privy.player',
      partialize: (s) => ({ queue: s.queue, index: s.index, position: s.position }),
    },
  ),
);

export const useCurrentTrack = () => usePlayer((s) => s.queue[s.index] as Track | undefined);

/** Длительность текущего трека: из файла, если узел не прислал duration_ms. */
export const useDuration = () => usePlayer((s) => s.mediaDuration || s.queue[s.index]?.durationSec || 0);
