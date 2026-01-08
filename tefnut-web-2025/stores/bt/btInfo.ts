import { create } from 'zustand';

// 全局bt登录状态，用以识别
type btInfo = {
	selectedUuid: string; // 当前选择的用户uuid
	selectedUser?: any; // 当前选择的服务器名
	userList: Array<any>; // 用户信息列表
	loggedIn: 'connected' | 'disconnected' | 'waitting' | 'firewalled'; // 登录状态，connected/disconnected/waitting/firewalled(表示受限连接，不影响正常使用)
	browserUrl: string; // 磁力连接地址
	defaultUrl: string; // 浏览器默认地址
	listOrder: 'eta' | 'dlspeed' | 'ratio' | 'name' | 'state' | 'time_active'; // 列表排序方式
	torrentsList: Array<any>; // 磁力列表
	totalDownloadSpeed: number; // 总下载速度
	totalUploadSpeed: number; // 总上传速度

	setLoggedIn: (loggedIn: 'connected' | 'disconnected' | 'waitting' | 'firewalled') => void;
	setSelectedUuid: (selectedUuid: string) => void;
	setSelectedUser: (selectedUser: any) => void;
	setBrowserUrl: (browserUrl: string) => void;
	setDefaultUrl: (defaultUrl: string) => void;
	setUserList: (userList: Array<any>) => void;
	setTotalDownloadSpeed: (totalDownloadSpeed: number) => void;
	setTotalUploadSpeed: (totalUploadSpeed: number) => void;
	setListOrder: (listOrder: 'eta' | 'dlspeed' | 'ratio' | 'name' | 'state' | 'time_active') => void;
	setTorrentsList: (torrentsList: Array<any>) => void;
};

export const useStore = create<btInfo>((set) => ({
	loggedIn: 'waitting',
	browserUrl: '',
	defaultUrl: 'https://www.bing.com',
	torrentsList: [],
	selectedUuid: '',
	selectedUser: {},
	listOrder: 'name',
	userList: [],
	totalDownloadSpeed: 0,
	totalUploadSpeed: 0,

	setUserList: (userList: Array<any>) => set({ userList }),
	setLoggedIn: (loggedIn: 'connected' | 'disconnected' | 'waitting' | 'firewalled') =>
		set({ loggedIn }),
	setBrowserUrl: (browserUrl: string) => set({ browserUrl }),
	setDefaultUrl: (defaultUrl: string) => set({ defaultUrl }),
	setTorrentsList: (torrentsList: Array<any>) => set({ torrentsList }),
	setSelectedUuid: (selectedUuid: string) => set({ selectedUuid }),
	setSelectedUser: (selectedUser: any) => set({ selectedUser }),
	setListOrder: (listOrder) => set({ listOrder }),
	setTotalDownloadSpeed: (totalDownloadSpeed: number) => set({ totalDownloadSpeed }),
	setTotalUploadSpeed: (totalUploadSpeed: number) => set({ totalUploadSpeed }),
}));
