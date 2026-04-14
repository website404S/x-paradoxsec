// src/store/useStore.ts
import { create } from 'zustand';

export interface ScanEntry {
  id: string;
  type: string;
  target: string;
  status: 'safe' | 'warning' | 'danger' | 'unknown';
  summary: string;
  timestamp: number;
}

interface Store {
  history: ScanEntry[];
  addHistory: (e: ScanEntry) => void;
  clearHistory: () => void;
  favorites: string[];
  addFavorite: (cmd: string) => void;
  removeFavorite: (cmd: string) => void;
}

export const useStore = create<Store>((set) => ({
  history: [],
  addHistory: (e) => set((s) => ({ history: [e, ...s.history].slice(0, 200) })),
  clearHistory: () => set({ history: [] }),
  favorites: [],
  addFavorite: (cmd) => set((s) => ({ favorites: [...new Set([...s.favorites, cmd])] })),
  removeFavorite: (cmd) => set((s) => ({ favorites: s.favorites.filter((f) => f !== cmd) })),
}));
