import { create } from 'zustand';

// 全局bt登录状态，用以识别
type btLoginfo = {
  loggedIn: boolean;
  setLoggedIn: (loggedIn: boolean) => void;
};

export const useStore = create<btLoginfo>((set) => ({
  loggedIn: false,
  setLoggedIn: (loggedIn: boolean) => set({ loggedIn }),
}));