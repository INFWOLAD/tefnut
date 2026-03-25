import { ChartContainer } from '@/components/charts/chart-container';
import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { ScrollView } from '@/components/ui/scroll-view';
import { bankInfo } from '@/utils/tallyBankCode';
import { LIST_VIA_BANK } from '@/utils/tallySQL';
import { bankCodeTrans } from '@/utils/tallyBankCode';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { formatAmount } from '@/utils/formatAmount';
import { Separator } from '@/components/ui/separator';
import { View } from '@/components/ui/view';
import { TreeMapChart } from '@/components/charts/treemap-chart';

export default function TallyChart() {
	const [pieData, setPieData] = useState<Array<{ label: string; value: number }>>([]);
	const [totalAmount, setTotalAmount] = useState(0);
	const [loading, setLoading] = useState(true);
	const db = SQLite.openDatabaseSync('app.db');
	const totalInfo: Array<any> = Object.keys(bankInfo);

	useEffect(() => {
		(async () => {
			const results = await Promise.all(
				totalInfo.map(async (item) => {
					const itemList = await db.getAllAsync(LIST_VIA_BANK, item);

					if (!itemList || itemList.length === 0) return null;

					const eachAmount = (itemList as Array<{ amount?: number | string }>).reduce(
						(sum, current) => sum + Number(current.amount ?? 0),
						0,
					);
					setTotalAmount((prevTotal) => prevTotal + eachAmount);
					return {
						label: bankCodeTrans(item),
						value: eachAmount,
					};
				}),
			);

			// 过滤掉 null
			setPieData(results.filter(Boolean) as Array<{ label: string; value: number }>);
			setLoading(false);
		})();
	}, []);

	return (
		<ScrollView style={{ flex: 1, paddingTop: 40 }}>
			{loading ? (
				<Spinner size="default" variant="default" />
			) : (
				<>
					<View style={{ marginBottom: 16 }}>
						<Text variant="subtitle" style={{ padding: 16 }}>
							汇总信息
						</Text>
						<Text variant="body" style={{ paddingHorizontal: 24 }}>
							总存单累计金额：{formatAmount(totalAmount.toString())} 元
						</Text>
						<Text variant="body" style={{ paddingHorizontal: 24 }}>
							存单分布银行数：{pieData.length} 个
						</Text>
					</View>
					<Separator style={{ marginVertical: 16 }} />
					<ChartContainer title="存单统计" description="">
						<TreeMapChart
							data={pieData}
							config={{
								height: 500,
								showLabels: true,
								animated: true,
								duration: 1500,
							}}
						/>
					</ChartContainer>
				</>
			)}
		</ScrollView>
	);
}
