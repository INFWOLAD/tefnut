import { create } from "zustand";

// 全局bt登录状态，用以识别
type btInfo = {
  loggedIn: boolean;
  browserUrl: string; // 磁力连接地址
  defaultUrl: string; // 浏览器默认地址

  setLoggedIn: (loggedIn: boolean) => void;
  setBrowserUrl: (browserUrl: string) => void;
  setDefaultUrl: (defaultUrl: string) => void;
};

export const useStore = create<btInfo>((set) => ({
  loggedIn: false,
  browserUrl: "",
  defaultUrl: "https://www.bing.com",

  setLoggedIn: (loggedIn: boolean) => set({ loggedIn }),
  setBrowserUrl: (browserUrl: string) => set({ browserUrl }),
  setDefaultUrl: (defaultUrl: string) => set({ defaultUrl }),
}));
