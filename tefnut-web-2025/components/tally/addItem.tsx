import { Text } from "@/components/ui/text";
import { useTallyStore } from "@/stores/tally/tally";
import { GroupedInput, GroupedInputItem, Input } from "../ui/input";
import { DatePicker, DateRange } from "@/components/ui/date-picker";
import { Picker } from "../ui/picker";
import { useEffect, useState } from "react";

export default function AddItem() {
  const storeAddItem = useTallyStore((state) => state.addItems);
  const setStoreAddItem = useTallyStore((state) => state.setAddItem);

  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const bankOptions = [
    { label: "众邦银行", value: "Z-BANK" },
    { label: "富民银行", value: "F-BANK" },
  ];

  useEffect(() => {
    if (dateRange) {
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
        label="存单日期范围"
        value={dateRange}
        onChange={setDateRange}
        placeholder="选择日期范围"
      />
      <Input
        label="现金利率 (%)"
        value={storeAddItem.cashRate}
        onChangeText={(text) =>
          setStoreAddItem({ ...storeAddItem, cashRate: text })
        }
        placeholder="输入现金利率"
      />
      <Input
        label="额外利率 (%)"
        value={storeAddItem.extraRate}
        onChangeText={(text) =>
          setStoreAddItem({ ...storeAddItem, extraRate: text })
        }
        placeholder="输入额外利率"
      />
      <Input
        label="总利率 (%)"
        value={storeAddItem.totalRate}
        onChangeText={(text) =>
          setStoreAddItem({ ...storeAddItem, totalRate: text })
        }
        placeholder="输入总利率"
      />
      <Input
        label="存单金额 (元)"
        value={storeAddItem.amount}
        onChangeText={(text) =>
          setStoreAddItem({ ...storeAddItem, amount: text })
        }
        placeholder="输入存单金额"
      />
    </>
  );
}
