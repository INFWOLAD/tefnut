import React from 'react';
import { View } from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import { useStore as useBtStore } from '@/stores/bt/btInfo';
import { Icon } from '@/components/ui/icon';
import { ChartNetwork, CloudDownload, CloudUpload, UserRoundCheck } from 'lucide-react-native';
import { Platform } from 'react-native';
import { useColor } from '@/hooks/useColor';

export function BtToalInfoHud() {
	const storeTorrentsList = useBtStore((state) => state.torrentsList);
	const storeSelectedUser = useBtStore((state) => state.selectedUser);
	const storeTotalDownloadSpeed = useBtStore((state) => state.totalDownloadSpeed);
	const storeTotalUploadSpeed = useBtStore((state) => state.totalUploadSpeed);
	const themeColor = useColor('text');
	return (
		<View
			style={{
				justifyContent: 'space-between',
				flexDirection: 'row',
				paddingTop: Platform.OS === 'android' ? 0 : 70,
				paddingHorizontal: 14,
			}}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<Icon name={ChartNetwork} size={14} />
				<Text style={{ fontSize: 14, color: themeColor, opacity: 0.8 }}>
					{storeTorrentsList.length}
				</Text>
			</View>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<Icon name={UserRoundCheck} size={14} />
				<Text style={{ fontSize: 14, color: themeColor, opacity: 0.8 }}>
					{storeSelectedUser?.nickname || '未知'}
				</Text>
			</View>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<Icon name={CloudDownload} size={14} />
				<Text style={{ fontSize: 14, color: themeColor, opacity: 0.8 }}>
					{(storeTotalDownloadSpeed / 1024 / 1024).toFixed(2)} MB/s
				</Text>
			</View>
			<View style={{ flexDirection: 'row', alignItems: 'center' }}>
				<Icon name={CloudUpload} size={14} />
				<Text style={{ fontSize: 14, color: themeColor, opacity: 0.8 }}>
					{(storeTotalUploadSpeed / 1024 / 1024).toFixed(2)} MB/s
				</Text>
			</View>
		</View>
	);
}
