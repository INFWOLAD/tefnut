import { Card } from '@/components/ui/card';
import {
	Combobox,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxTrigger,
	ComboboxValue,
	OptionType,
} from '@/components/ui/combobox';
import { Picker } from '@/components/ui/picker';
import { BottomSheet, useBottomSheet } from '@/components/ui/bottom-sheet';
import { View } from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { showSuccessAlert, showErrorAlert } from '@/components/ui/alert';
import * as SecureStore from 'expo-secure-store';
import { use, useEffect, useRef, useState } from 'react';
import { useStore as useBtStore } from '@/stores/bt/btInfo';
import { useBtLogin } from '@/hooks/useBtLogin';
import { createRequestController, request } from '@/utils/request';
import { TextInput, Pressable } from 'react-native';
import { useColor } from '@/hooks/useColor';
import { useStore } from '@/stores/bt/btInfo';
import { BtLoginSheet } from '@/components/bt/btLoginSheet';
import { ListOrdered } from 'lucide-react-native';

const listOrderOptions: Array<{ label: string; value: string }> = [
	{ label: '预计完成时间', value: 'eta' },
	{ label: '下载速度', value: 'dlspeed' },
	{ label: '分享率', value: 'ratio' },
	{ label: '名称', value: 'name' },
	{ label: '状态', value: 'state' },
	{ label: '活动时间', value: 'time_active' },
];

export default function BtSetting() {
	// bt 登录hook
	const { btLogin, loading } = useBtLogin();
	// bt zustand
	const storeUserList = useStore((state) => state.userList);
	const storeSelectedUuid = useStore((state) => state.selectedUuid);
	const storeDefaultUrl = useStore((state) => state.defaultUrl);
	const storeSetUserList = useStore((state) => state.setUserList);
	const storeSetSelectedUuid = useStore((state) => state.setSelectedUuid);
	const storeSetDefaultUrl = useStore((state) => state.setDefaultUrl);
	const storeSetListOrder = useStore((state) => state.setListOrder);
	const storeSetSelectedUser = useStore((state) => state.setSelectedUser);
	const storeSetTotalDownloadSpeed = useStore((state) => state.setTotalDownloadSpeed);
	const storeSetTotalUploadSpeed = useStore((state) => state.setTotalUploadSpeed);
	// bt 选择框搜索和选中
	const [btSearch, setBtSearch] = useState<OptionType | null>(null);
	const [localOrder, setLocalOrder] = useState<string>('name');
	// bt 底部弹出框
	const btSheet = useBottomSheet();
	// bt zustand
	const btloginfo = useBtStore();
	// textinput组件用颜色
	const themeColor = useColor('text');
	const disableColor = useColor('textMuted');
	const canSelect = useColor('blue');
	const errorColor = useColor('red');
	// 计时器id，防止重复生成
	const intervalRef = useRef<number | null>(null);

	useEffect(() => {
		// 尝试从安全存储中获取已保存的凭据
		(async () => {
			// bt以string存储的用户信息列表和默认用户
			const userString = await SecureStore.getItemAsync('bt_userList');
			//   以uuid存储当前选择用户
			const userDefaultUuid = await SecureStore.getItemAsync('bt_selectedUuid');
			const userList = userString ? JSON.parse(userString) : [];
			storeSetUserList(userList);
			if (userDefaultUuid) {
				// uuid变化自动拉起登录
				storeSetSelectedUuid(userDefaultUuid);
			}
		})();
	}, []);

	useEffect(() => {
		// 根据搜索内容更新选中项
		if (btSearch) {
			// uuid变化自动拉起登录
			storeSetSelectedUuid(btSearch.value);
		}
	}, [btSearch]);

	useEffect(() => {
		storeSetListOrder(localOrder as any);
	}, [localOrder]);

	// uuid变化执行登录
	useEffect(() => {
		(async () => {
			console.log('BT selected UUID changed:', storeSelectedUuid);
			if (storeSelectedUuid) {
				const selected = storeUserList.find((u: any) => u.uuid === storeSelectedUuid);
				// 如果找到了对应用户则尝试重新登录
				if (selected) {
					const localController = createRequestController();
					const result = await btLogin(
						selected.url,
						selected.username,
						selected.password,
						localController,
						true,
					);
					// 登录成功放入缓存
					if (result) {
						btloginfo.setLoggedIn('connected');
						storeSetSelectedUser(selected);
						await SecureStore.setItemAsync('bt_selectedUuid', selected.uuid);
					} else {
						btloginfo.setLoggedIn('disconnected');
					}
					console.log('Selected BT user:', selected);
					if (intervalRef.current) {
						clearInterval(intervalRef.current);
						intervalRef.current = null;
					}
					startInterval(selected);
				}
			}
		})();
		// 卸载组件时执行清理
		return () => {
			if (intervalRef.current !== null) {
				clearInterval(intervalRef.current);
				intervalRef.current = null;
			}
		};
	}, [storeSelectedUuid]);

	// 定时刷新计时器
	async function startInterval(selectedUser: any) {
		if (!intervalRef.current) {
			// 探活请求
			intervalRef.current = setInterval(async () => {
				try {
					// console.log("传入user", selectedUser);
					const result = await request({
						url: `${selectedUser.url}/api/v2/transfer/info`,
						method: 'POST',
						toast: null,
						withOutLog: true,
					});
					if (result.connection_status === 'disconnected' && intervalRef.current !== null) {
						btloginfo.setLoggedIn('disconnected');
						// 连接disconnect后清理计时器
						clearInterval(intervalRef.current);
						intervalRef.current = null;
					} else if (result.connection_status === 'connected') {
						btloginfo.setLoggedIn('connected');
						storeSetTotalDownloadSpeed(result.dl_info_speed);
						storeSetTotalUploadSpeed(result.up_info_speed);
					} else if (result.connection_status === 'firewalled') {
						btloginfo.setLoggedIn('firewalled');
						storeSetTotalDownloadSpeed(result.dl_info_speed);
						storeSetTotalUploadSpeed(result.up_info_speed);
					}
				} catch (err) {
					console.log(err);

					// 错误后清理计时器
					if (intervalRef.current !== null) {
						clearInterval(intervalRef.current);
						intervalRef.current = null;
					}
				}
			}, 2000); // 每2秒拉取一次
		}
	}

	return (
		<>
			<View style={{ gap: 4, marginTop: 8 }}>
				{/* bt 用户选择 */}
				<Combobox value={btSearch} onValueChange={setBtSearch}>
					<ComboboxTrigger>
						<ComboboxValue
							placeholder={
								storeSelectedUuid
									? storeUserList.find((u: any) => u.uuid === storeSelectedUuid)?.nickname
									: '选择服务器'
							}
						/>
					</ComboboxTrigger>
					<ComboboxContent>
						<ComboboxInput placeholder="请输入服务器名称..." />
						<ComboboxList>
							<ComboboxEmpty>
								<Text style={{ color: disableColor, padding: 8 }}>无结果</Text>
							</ComboboxEmpty>
							{storeUserList.map((user: any) => (
								<ComboboxItem key={user.uuid} value={user.uuid}>
									{user.nickname}
								</ComboboxItem>
							))}
						</ComboboxList>
					</ComboboxContent>
				</Combobox>
				<Card>
					{storeSelectedUuid && (
						<>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'space-between',
									marginVertical: 2,
									height: 22,
								}}
							>
								<Text>连接状态</Text>
								<View
									style={{
										flexDirection: 'row',
										alignItems: 'center',
									}}
								>
									<Text>
										{(() => {
											if (btloginfo.loggedIn === 'connected') return '已连接';
											if (btloginfo.loggedIn === 'disconnected') return '未连接';
											if (btloginfo.loggedIn === 'firewalled') return '受限连接';
											if (btloginfo.loggedIn === 'waitting' || loading) return '连接中...';
										})()}
									</Text>
									<Badge
										variant={(() => {
											if (btloginfo.loggedIn === 'connected') return 'success';
											if (btloginfo.loggedIn === 'disconnected') return 'destructive';
											if (btloginfo.loggedIn === 'firewalled') return 'default';
											if (btloginfo.loggedIn === 'waitting' || loading) return 'outline';
										})()}
										style={{
											width: 12,
											height: 12,
											borderRadius: 8,
											paddingHorizontal: 0,
											paddingVertical: 0,
										}}
									>
										<View />
									</Badge>
								</View>
							</View>
							<Separator style={{ marginVertical: 8 }} />
						</>
					)}

					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							marginVertical: 2,
						}}
					>
						<Text>主页地址</Text>
						<TextInput
							value={storeDefaultUrl}
							onChangeText={storeSetDefaultUrl}
							keyboardType="url"
							style={{
								color: themeColor,
								fontSize: 16,
								flex: 1,
								textAlign: 'right',
								padding: 0,
							}}
						></TextInput>
					</View>
					<Separator style={{ marginVertical: 8 }} />
					<View
						style={{
							flexDirection: 'row',
							marginVertical: 2,
						}}
					>
						{/* <Text>列表排序方式</Text> */}
						<Picker
							options={listOrderOptions}
							value={localOrder}
							label="列表排序方式"
							onValueChange={setLocalOrder}
							variant="group"
							inputStyle={{ flex: 1, textAlign: 'right' }}
							labelStyle={{ color: themeColor }}
						/>
					</View>
					<Separator style={{ marginVertical: 8 }} />
					<View
						style={{
							marginVertical: 2,
						}}
					>
						<Pressable onPress={() => btSheet.open()}>
							<Text style={{ color: canSelect }}>添加新服务器</Text>
						</Pressable>
						{storeSelectedUuid && (
							<>
								<Separator style={{ marginVertical: 8 }} />
								<Pressable
									onPress={() => {
										if (storeSelectedUuid) {
											const updatedUserList = storeUserList.filter(
												(u: any) => u.uuid !== storeSelectedUuid,
											);
											storeSetUserList(updatedUserList);
											SecureStore.setItemAsync('bt_userList', JSON.stringify(updatedUserList));
											setBtSearch(null);
											storeSetSelectedUuid('');
											storeSetSelectedUser({});
											SecureStore.deleteItemAsync('bt_selectedUuid');
											btloginfo.setLoggedIn('disconnected');
										}
									}}
								>
									<Text style={{ color: errorColor }}>删除当前服务器</Text>
								</Pressable>
							</>
						)}
					</View>
				</Card>
			</View>
			<BottomSheet
				isVisible={btSheet.isVisible}
				onClose={() => btSheet.close()}
				snapPoints={[0.5, 0.6]}
				enableBackdropDismiss={true}
			>
				<BtLoginSheet sheetRef={btSheet} />
			</BottomSheet>
		</>
	);
}
