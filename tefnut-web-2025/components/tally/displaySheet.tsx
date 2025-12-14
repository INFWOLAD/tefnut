import { bankCodeTrans } from "@/utils/tallyBankCode";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { ScrollView } from "@/components/ui/scroll-view";

interface DisPlaySheetProps {
  item: any;
}

export default function DisPlaySheet({ item }: DisPlaySheetProps) {
  const infoList: { [key: string]: string } = {
    银行名称: bankCodeTrans(item.bankShort),
    开始日期: new Date(Number(item.startDate)).toLocaleDateString(),
    到期日期: new Date(Number(item.endDate)).toLocaleDateString(),
    现金利率: `${item.cashRate}%`,
    额外利率: `${item.extraRate}%`,
    总利率: `${item.totalRate}%`,
    金额: `¥${item.amount}`,
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
            flexDirection: "row",
            justifyContent: "space-between",
          }}
          key={index}
        >
          <Text variant="body" style={{ fontWeight: "600" }}>
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
