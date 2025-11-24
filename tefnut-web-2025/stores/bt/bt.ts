import { create } from 'zustand';

type btState = {
  url: string;
  setUrl: (url: string) => void;
};

export const useStore = create<btState>((set) => ({
  url: '',
  setUrl: (url: string) => set({ url }),
}));