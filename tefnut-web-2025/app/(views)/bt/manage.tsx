import { ScrollView } from '@/components/ui/scroll-view';
import { View } from '@/components/ui/view';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { Card } from '@/components/ui/card';
import { Link } from '@/components/ui/link';
import { useBottomSheet, BottomSheet } from '@/components/ui/bottom-sheet';
import { Plus, ClipboardPaste, Compass } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { useEffect, useState, useRef } from 'react';
import { Pressable, Platform } from 'react-native';
import { request } from '@/utils/request';
import { useStore as useBtStore } from '@/stores/bt/btInfo';
import { showSuccessAlert } from '@/components/ui/alert';
import { BtTorrentInfo } from '@/components/bt/btTorrentInfo';
import { BtEmptyList } from '@/components/bt/btEmptyList';
import { BtDisplayCard } from '@/components/bt/btDisplayCard';
import { BtToalInfoHud } from '@/components/bt/btTotalInfoHud';
import { callbackResult } from '@/components/browser';

export default function BtManageScreen() {
	const { toast } = useToast();
	// bt zustand状态管理
	const storeSelectedUser = useBtStore((state) => state.selectedUser);
	const storeTorrentsList = useBtStore((state) => state.torrentsList);
	const storeBrowserUrl = useBtStore((state) => state.browserUrl);
	const storeListOrder = useBtStore((state) => state.listOrder);
	const storeSetBrowserUrl = useBtStore((state) => state.setBrowserUrl);
	const storeSetTorrentsList = useBtStore((state) => state.setTorrentsList);

	const navigation = useNavigation();
	// 添加磁力弹窗
	const magnetBottomSheet = useBottomSheet();
	// 种子管理弹窗
	const torrentInfoSheet = useBottomSheet();
	const [selectTorrent, setSelectTorrent] = useState<{
		[key: string]: string | number;
	}>({});
	// 磁力链接输入内容
	const [magnet, setMagnet] = useState('');
	// 种子列表加载状态
	const [listLoading, setListLoading] = useState(true);
	// 种子添加加载状态
	const [adding, setAdding] = useState(false);

	// 计时器id，防止重复生成
	const intervalRef = useRef<number | null>(null);

	useEffect(() => {
		(async () => {
			// 立刻执行一次，随后计时器启动
			await fetchTorrents(true);
			navigation.setOptions({
				title: '',
				headerRight: () => {
					return (
						<>
							{/* 浏览器页 */}
							{Platform.OS === 'android' ? (
								<Pressable
									onPress={() => {
										router.push('/bt/btSheet');
									}}
									hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
									accessibilityRole="button"
									android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
									style={{
										padding: 6,
										justifyContent: 'center',
										alignItems: 'center',
										marginRight: 20,
									}}
								>
									<Icon name={Compass} size={24} />
								</Pressable>
							) : (
								<Link
									href="/bt/btSheet"
									style={{
										padding: 6,
										justifyContent: 'center',
										alignItems: 'center',
										marginRight: 20,
										marginLeft: 8,
									}}
									asChild
								>
									<Icon name={Compass} size={24} />
								</Link>
							)}

							{/* 直接读取剪贴板添加 */}
							<Pressable
								onPress={() => {
									handleClipboardAdd();
								}}
								hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
								accessibilityRole="button"
								android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
								style={{
									padding: 6,
									justifyContent: 'center',
									alignItems: 'center',
									marginRight: 20,
								}}
							>
								{adding && <Spinner />}
								{!adding && <Icon name={ClipboardPaste} size={24} />}
							</Pressable>
							{/* 手动添加 */}
							<Pressable
								onPress={() => {
									magnetBottomSheet.open();
								}}
								hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
								accessibilityRole="button"
								android_ripple={{ color: 'rgba(0,0,0,0.08)' }}
								style={{
									padding: 6,
									justifyContent: 'center',
									alignItems: 'center',
								}}
							>
								<Icon name={Plus} size={24} />
							</Pressable>
						</>
					);
				},
			});
			// 拉起页面加载计时器，页面销毁清除计时器
			startInterval();
			// 卸载组件时执行清理
			return () => {
				if (intervalRef.current !== null) {
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
			};
		})();
	}, []);

	// 全局磁力，变化即添加,静默, 唯一调用为浏览器捕获
	useEffect(() => {
		(async () => {
			console.log(`调用下载${storeBrowserUrl}`);
			if (storeBrowserUrl) {
				const result = await handleSubmit(storeBrowserUrl, true);
				callbackResult(result);
			}
		})();
		return () => {
			console.log('清空浏览器捕获的磁力');
			storeSetBrowserUrl('');
		};
	}, [storeBrowserUrl]);

	// 快速剪贴板添加
	async function handleClipboardAdd() {
		setAdding(true);
		const clipboardContent = await Clipboard.getStringAsync();
		console.log('Clipboard content:', clipboardContent);
		if (!clipboardContent.startsWith('magnet:')) {
			showSuccessAlert('提示', '剪贴板中非磁力连接', () => setAdding(false));
			return;
		}
		handleSubmit(clipboardContent);
		setAdding(false);
	}

	// 定时刷新计时器
	async function startInterval() {
		if (!intervalRef.current) {
			// 首次请求拉去任务列表
			intervalRef.current = setInterval(async () => {
				const result = await fetchTorrents(true);
				if (!result && intervalRef.current !== null) {
					// 错误后清理计时器
					clearInterval(intervalRef.current);
					intervalRef.current = null;
				}
			}, 2000); // 每2秒拉取一次
		}
	}

	// 拉取任务列表
	async function fetchTorrents(silence = false) {
		!silence && setListLoading(true);
		try {
			const response = await request({
				// url: `${btUrl.current}/api/v2/sync/maindata?rid=${rid}`,
				url: `${storeSelectedUser?.url}/api/v2/torrents/info?sort=${storeListOrder}`,
				method: 'POST',
				toast,
				withOutLog: true,
			});
			storeSetTorrentsList(response);
		} catch (error) {
			console.log('Error fetching torrents:', error);
			return false;
		} finally {
			setListLoading(false);
		}
		// 由于网络问题导致请求失败，手动刷新时重新拉起计时器
		startInterval();
		return true;
	}

	// 添加磁力
	async function handleSubmit(Magnet: string = magnet, slience: boolean = false) {
		// 处理提交逻辑
		const formData = new FormData();
		formData.append('urls', Magnet);
		magnetBottomSheet.close();
		console.log('Submitting magnet link:', Magnet, formData, storeSelectedUser?.url);
		// 从zustand中取login的url
		const response = await request({
			url: `${storeSelectedUser?.url}/api/v2/torrents/add`,
			method: 'POST',
			headers: {
				'Content-Type': 'multipart/form-data;',
			},
			data: formData,
			toast,
		});
		console.log('Add torrent response:', response);
		// 清空输入框
		setMagnet('');
		if (response && response.includes('Ok.')) {
			// 静默返回成功标识
			if (slience) return true;
			toast({
				title: '成功',
				description: '已添加下载任务',
				variant: 'success',
			});
		} else {
			if (slience) return false;
			toast({
				title: '失败',
				description: '添加任务失败，请检查链接或稍后重试',
				variant: 'error',
			});
		}
	}

	return (
		<>
			<SafeAreaView edges={['top', 'left', 'right']} style={{ flex: 1 }}>
				{listLoading && (
					<View
						style={{
							flex: 1,
							justifyContent: 'center',
							gap: 16,
							paddingHorizontal: 24,
						}}
					>
						<Spinner variant="dots" />
					</View>
				)}
				{!listLoading && (
					<>
						{/* 汇总信息hud */}
						<BtToalInfoHud />
						{/* 种子列表 */}
						<ScrollView
							style={{
								flex: 1,
								padding: 12,
							}}
							contentContainerStyle={{ flexGrow: 1 }} // 允许内容区域撑满高度
						>
							<View style={{ flex: 1, gap: 16 }}>
								{storeTorrentsList.length === 0 && <BtEmptyList />}
								{storeTorrentsList.map((torrent, index) => (
									<Card key={index}>
										<Pressable
											onPress={() => {
												setSelectTorrent(torrent);
												torrentInfoSheet.open();
											}}
										>
											{/* 任务卡片 */}
											<BtDisplayCard torrent={torrent} />
										</Pressable>
									</Card>
								))}
							</View>
							{/* 磁力添加sheet */}
							<BottomSheet
								isVisible={magnetBottomSheet.isVisible}
								onClose={() => {
									magnetBottomSheet.close();
									setMagnet('');
								}}
								title="新增磁力下载"
								snapPoints={[0.3, 0.5]}
								enableBackdropDismiss={true}
							>
								<View style={{ gap: 20 }}>
									<View style={{ gap: 12 }}>
										<Input
											value={magnet}
											onChangeText={setMagnet}
											variant="outline"
											placeholder="Enter your magnet link"
										/>
									</View>
									<View
										style={{
											flex: 1,
											width: '100%',
											flexDirection: 'row',
											gap: 12,
											marginTop: 12,
										}}
									>
										<Button
											variant="outline"
											onPress={() => {
												magnetBottomSheet.close();
												setMagnet('');
											}}
											style={{ flex: 1 }}
										>
											取消
										</Button>
										<Button onPress={handleSubmit} style={{ flex: 1 }}>
											添加
										</Button>
									</View>
								</View>
							</BottomSheet>
							{/* 磁力信息页 */}
							<BottomSheet
								isVisible={torrentInfoSheet.isVisible}
								onClose={() => {
									torrentInfoSheet.close();
								}}
								snapPoints={[0.7, 0.9]}
								enableBackdropDismiss={true}
							>
								<BtTorrentInfo torrent={selectTorrent} sheetRef={torrentInfoSheet} />
							</BottomSheet>
						</ScrollView>
					</>
				)}
			</SafeAreaView>
		</>
	);
}
