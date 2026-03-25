import { View } from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';
import { Icon } from '@/components/ui/icon';
import { HardDriveDownload } from 'lucide-react-native';

export function BtEmptyList() {
	return (
		<View
			style={{
				justifyContent: 'center', // 垂直居中
				alignItems: 'center', // 水平居中
				flex: 1,
			}}
		>
			<Icon name={HardDriveDownload} size={48} style={{ marginBottom: 12, opacity: 0.8 }} />
			<Text style={{ marginBottom: 12, opacity: 0.6 }}>任务列表为空</Text>
			<Accordion type="single" collapsible defaultValue="item-1">
				<AccordionItem value="item-1">
					<AccordionTrigger>如何手动添加磁力？</AccordionTrigger>
					<AccordionContent>
						<Text style={{ opacity: 0.8 }}>点击右上角的"+"按钮，输入磁力链接添加下载任务。</Text>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-2">
					<AccordionTrigger>如何从剪贴板读取磁力？</AccordionTrigger>
					<AccordionContent>
						<Text style={{ opacity: 0.8 }}>
							将磁力链接复制到剪贴板后，点击右上角的粘贴按钮即可快速添加任务。
						</Text>
					</AccordionContent>
				</AccordionItem>
				<AccordionItem value="item-3">
					<AccordionTrigger>如何浏览网页的同时添加下载？</AccordionTrigger>
					<AccordionContent>
						<Text style={{ opacity: 0.8 }}>
							点击右上角的指南针图标，进入内置浏览器页面，访问含有磁力链接的网页并点击磁力连接时，应用会自动捕获并添加下载任务。
						</Text>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</View>
	);
}
