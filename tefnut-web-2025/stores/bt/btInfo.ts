import { create } from "zustand";

// 全局bt登录状态，用以识别
type btInfo = {
  loggedIn: boolean;
  browserUrl: string;

  setLoggedIn: (loggedIn: boolean) => void;
  setBrowserUrl: (browserUrl: string) => void;
};

export const useStore = create<btInfo>((set) => ({
  loggedIn: false,
  browserUrl: "",

  setLoggedIn: (loggedIn: boolean) => set({ loggedIn }),
  setBrowserUrl: (browserUrl: string) => set({ browserUrl }),
}));
