import { CardContent } from '@/components/ui/card';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface BtDisplayCardProps {
	torrent: any;
}

const stateMap: { [key: string]: string } = {
	error: '错误',
	pausedUP: '上传已暂停',
	pausedDL: '下载已暂停',
	queuedUP: '排队上传',
	queuedDL: '排队下载',
	checkingUP: '检查上传',
	checkingDL: '检查下载',
	downloading: '下载中',
	stalledDL: '下载停滞',
	checkingResumeData: '检查恢复数据',
	moving: '移动中',
	uploading: '上传中',
	stalledUP: '上传停滞',
	unknown: '未知状态',
};
export function BtDisplayCard({ torrent }: BtDisplayCardProps) {
	return (
		<CardContent>
			<Text style={{ marginBottom: 8, fontWeight: '600' }} numberOfLines={1}>
				{torrent.name}
			</Text>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					marginBottom: 8,
				}}
			>
				<Text style={{ fontSize: 12, color: '#666' }}>
					剩余时间: {(torrent.eta / 60 / 60).toFixed(2)} hrs
				</Text>
				<Text style={{ fontSize: 12, color: '#666' }}>
					速度: {(torrent.dlspeed / 1024 / 1024).toFixed(2)} MB/s
				</Text>
				<Text style={{ fontSize: 12, color: '#666' }}>
					上传: {(torrent.upspeed / 1024 / 1024).toFixed(2)} MB/s
				</Text>
			</View>
			<View
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
				}}
			>
				<Badge
					variant={
						torrent.state === 'downloading'
							? 'success'
							: torrent.state === 'pausedDL'
								? 'default'
								: 'outline'
					}
					style={{
						height: 14,
						borderRadius: 8,
						paddingHorizontal: 4,
						paddingVertical: 0,
					}}
					textStyle={{ fontSize: 11 }}
				>
					{stateMap[torrent.state] || '未知状态'}
				</Badge>
				<Text
					variant="caption"
					style={{
						color: '#666',
						fontSize: 14,
						textAlign: 'right',
					}}
				>
					{(torrent.progress * 100).toFixed(2)}%
				</Text>
			</View>
			<Progress value={torrent.progress * 100} height={5} />
		</CardContent>
	);
}
