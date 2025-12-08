import { Text } from "@/components/ui/text";
import { useTallyStore } from "@/stores/tally/tally";
import { GroupedInput, GroupedInputItem, Input } from "../ui/input";
import { DatePicker, DateRange } from "@/components/ui/date-picker";
import { Picker } from "../ui/picker";
import { useEffect, useState } from "react";
import {
  BadgeJapaneseYen,
  BadgePercent,
  Landmark,
  SquarePercent,
  TicketPercent,
} from "lucide-react-native";
import { bankCode } from "@/utils/tallyBankCode";

export default function AddItem() {
  const storeAddItem = useTallyStore((state) => state.addItems);
  const storeSaveAddItem = useTallyStore((state) => state.saveAddItem);
  const setStoreSaveAddItem = useTallyStore((state) => state.setSaveAddItem);
  const setStoreAddItem = useTallyStore((state) => state.setAddItem);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const bankOptions = Object.entries(bankCode).map(([code, name]) => ({
    label: name,
    value: code,
  }));

  const saveOptions = [
    { label: "是", value: "true" },
    { label: "否", value: "false" },
  ];

  useEffect(() => {
    if (dateRange?.startDate && dateRange?.endDate) {
      setStoreAddItem({
        ...storeAddItem,
        // 以时间戳形式存储
        startDate: dateRange.startDate?.getTime() || 0,
        endDate: dateRange.endDate?.getTime() || 0,
      });
    }
  }, [dateRange]);

  return (
    <>
      <Picker
        icon={Landmark}
        label="银行名称"
        options={bankOptions}
        value={storeAddItem.bankShort}
        onValueChange={(value) =>
          setStoreAddItem({ ...storeAddItem, bankShort: value })
        }
        placeholder="选择银行名称"
        searchable
        searchPlaceholder="搜索银行..."
        modalTitle="银行"
      />
      <DatePicker
        mode="range"
        label="存单日期"
        value={dateRange}
        onChange={setDateRange}
        placeholder="选择日期范围"
      />
      <Input
        icon={TicketPercent}
        label="现金利率"
        value={storeAddItem.cashRate}
        onChangeText={(text) =>
          setStoreAddItem({ ...storeAddItem, cashRate: text })
        }
        placeholder="输入现金利率(%)"
      />
      <Input
        icon={BadgePercent}
        label="额外利率"
        value={storeAddItem.extraRate}
        onChangeText={(text) =>
          setStoreAddItem({ ...storeAddItem, extraRate: text })
        }
        placeholder="输入额外利率(%)"
      />
      <Input
        icon={SquarePercent}
        label="汇总利率"
        value={storeAddItem.totalRate}
        onChangeText={(text) =>
          setStoreAddItem({ ...storeAddItem, totalRate: text })
        }
        placeholder="输入总利率(%)"
      />
      <Input
        icon={BadgeJapaneseYen}
        label="存单金额"
        value={storeAddItem.amount}
        onChangeText={(text) =>
          setStoreAddItem({ ...storeAddItem, amount: text })
        }
        placeholder="输入存单金额"
      />
      <Picker
        icon={SquarePercent}
        label="保存信息"
        options={saveOptions}
        value={storeSaveAddItem ? "true" : "false"}
        onValueChange={(value) => setStoreSaveAddItem(value === "true")}
        placeholder="选择是否保存"
        modalTitle="保存选项"
      />
    </>
  );
}
