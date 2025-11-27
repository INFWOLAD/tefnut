import { create } from "zustand";

// 全局bt登录状态，用以识别
type btInfo = {
  loggedIn: boolean;
  browserUrl: string; // 磁力连接地址
  defaultUrl: string; // 浏览器默认地址
  torrentsList: Array<any>; // 磁力列表

  setLoggedIn: (loggedIn: boolean) => void;
  setBrowserUrl: (browserUrl: string) => void;
  setDefaultUrl: (defaultUrl: string) => void;
  setTorrentsList: (torrentsList: Array<any>) => void;
};

export const useStore = create<btInfo>((set) => ({
  loggedIn: false,
  browserUrl: "",
  defaultUrl: "https://www.bing.com",
  torrentsList: [],

  setLoggedIn: (loggedIn: boolean) => set({ loggedIn }),
  setBrowserUrl: (browserUrl: string) => set({ browserUrl }),
  setDefaultUrl: (defaultUrl: string) => set({ defaultUrl }),
  setTorrentsList: (torrentsList: Array<any>) => set({ torrentsList }),
}));
