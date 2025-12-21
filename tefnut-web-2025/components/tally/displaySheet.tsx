import { bankCodeTrans } from '@/utils/tallyBankCode';
import { View } from '@/components/ui/view';
import { Text } from '@/components/ui/text';
import { ScrollView } from '@/components/ui/scroll-view';
import { formatAmount } from '@/utils/formatAmount';
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';

interface DisPlaySheetProps {
	item: any;
}

export default function DisPlaySheet({ item }: DisPlaySheetProps) {
	const infoList: { [key: string]: string } = {
		银行名称: bankCodeTrans(item.bankShort),
		开始日期: dayjs(Number(item.startDate)).format('YYYY-MM-DD'),
		到期日期: dayjs(Number(item.endDate)).format('YYYY-MM-DD'),
		现金利率: `${item.cashRate}%`,
		额外利率: `${item.extraRate}%`,
		总利率: `${item.totalRate}%`,
		当前利息: `¥ ${formatAmount(
			(
				BigNumber(item.amount).multipliedBy(item.totalRate).dividedBy(36500).toNumber() *
				dayjs(Math.min(Number(item.endDate), Date.now())).diff(dayjs(Number(item.startDate)), 'day')
			).toFixed(2),
		)}`,
		到期利息: `¥ ${formatAmount(
			(
				BigNumber(item.amount).multipliedBy(item.totalRate).dividedBy(36500).toNumber() *
				dayjs(Number(item.endDate)).diff(dayjs(Number(item.startDate)), 'day')
			).toFixed(2),
		)}`,
		金额: `¥ ${formatAmount(item.amount)}`,
	};
	return (
		<ScrollView
			style={{
				flex: 1,
				padding: 12,
			}}
		>
			{Object.entries(infoList).map(([key, value], index) => (
				<View
					style={{
						marginBottom: 12,
						flexDirection: 'row',
						justifyContent: 'space-between',
					}}
					key={index}
				>
					<Text variant="body" style={{ fontWeight: '600' }}>
						{key}
					</Text>
					<Text variant="caption" style={{ marginTop: 2 }}>
						{value}
					</Text>
				</View>
			))}
		</ScrollView>
	);
}
