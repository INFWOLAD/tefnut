import { Text } from "@/components/ui/text";
import { useTallyStore } from "@/stores/tally/tally";
import { Input } from "@/components/ui/input";
import { Picker } from "../ui/picker";
import { useEffect, useState } from "react";
import {
  BadgeJapaneseYen,
  BadgePercent,
  Landmark,
  TicketPercent,
  Timer,
  TimerOff,
} from "lucide-react-native";
import { bankInfo } from "@/utils/tallyBankCode";
import BigNumber from "bignumber.js";

export default function AddItem() {
  const storeAddItem = useTallyStore((state) => state.addItems);
  const setStoreAddItem = useTallyStore((state) => state.setAddItem);
  const [dateStartText, setDateStartText] = useState<string>("");
  const [dateEndText, setDateEndText] = useState<string>("");
  const bankOptions = Object.entries(bankInfo).map(([code, info]) => ({
    label: info.name,
    value: code,
  }));

  useEffect(() => {
    // 拉起页面时初始化库表中时间戳，反显用户YYYYMMDD
    if (storeAddItem.startDate) {
      const date = new Date(storeAddItem.startDate);
      const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
      setDateStartText(formattedDate);
    }
    if (storeAddItem.endDate) {
      const date = new Date(storeAddItem.endDate);
      const formattedDate = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
      setDateEndText(formattedDate);
    }
  }, []);

  useEffect(() => {
    if (storeAddItem.extraRate && storeAddItem.cashRate) {
      const total = BigNumber(storeAddItem.extraRate).plus(
        storeAddItem.cashRate
      );
      setStoreAddItem({
        ...storeAddItem,
        totalRate: total.toString(),
      });
    }
  }, [storeAddItem.extraRate, storeAddItem.cashRate]);

  function handleDate(value: string, type: "start" | "end") {
    let inputDate = value.replace(/[^\d]/g, "");
    if (inputDate.length >= 5 && inputDate.length <= 6) {
      inputDate = inputDate.slice(0, 4) + "/" + inputDate.slice(4);
    } else if (inputDate.length > 6) {
      inputDate =
        inputDate.slice(0, 4) +
        "/" +
        inputDate.slice(4, 6) +
        "/" +
        inputDate.slice(6, 8);
    }
    if (type === "start") {
      setDateStartText(inputDate);
      if (inputDate.length === 10) {
        const [y, m, d] = inputDate.split("/").map(Number);
        const dateObj = new Date(y, m - 1, d).getTime();
        setStoreAddItem({
          ...storeAddItem,
          startDate: dateObj,
        });
      }
    } else {
      setDateEndText(inputDate);
      if (inputDate.length === 10) {
        const [y, m, d] = inputDate.split("/").map(Number);
        const dateObj = new Date(y, m - 1, d).getTime();
        setStoreAddItem({
          ...storeAddItem,
          endDate: dateObj,
        });
      }
    }
  }

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
      <Input
        icon={Timer}
        label="起始日期"
        value={dateStartText}
        onChangeText={(text) => handleDate(text, "start")}
        placeholder="YYYY/MM/DD"
        keyboardType={"numeric"}
      />
      <Input
        icon={TimerOff}
        label="截至日期"
        value={dateEndText}
        onChangeText={(text) => handleDate(text, "end")}
        placeholder="YYYY/MM/DD"
        keyboardType={"numeric"}
      />
      <Input
        icon={TicketPercent}
        label="现金利率"
        value={storeAddItem.cashRate}
        onChangeText={(text) =>
          setStoreAddItem({ ...storeAddItem, cashRate: text })
        }
        placeholder="输入现金利率(%)"
        keyboardType={"numeric"}
      />
      <Input
        icon={BadgePercent}
        label="额外利率"
        value={storeAddItem.extraRate}
        onChangeText={(text) =>
          setStoreAddItem({ ...storeAddItem, extraRate: text })
        }
        placeholder="输入额外利率(%)"
        keyboardType={"numeric"}
      />
      <Input
        icon={BadgeJapaneseYen}
        label="存单金额"
        value={storeAddItem.amount}
        onChangeText={(text) =>
          setStoreAddItem({ ...storeAddItem, amount: text })
        }
        placeholder="输入存单金额"
        keyboardType={"numeric"}
      />
    </>
  );
}
