import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  dense: boolean;
  setDense: (dense: boolean) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      dense: false,
      setDense: (dense) => set({ dense }),
    }),
    { name: 'privy.settings' },
  ),
);
