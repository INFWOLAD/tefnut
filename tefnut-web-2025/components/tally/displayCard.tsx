import { bankCodeTrans } from "@/utils/tallyBankCode";
import { Card, CardContent } from "../ui/card";
import { Text } from "../ui/text";
import { View } from "../ui/view";
import { useEffect } from "react";
import { Progress } from "../ui/progress";

interface DisplayListProps {
  item: any;
}

export default function DisplayList({ item }: DisplayListProps) {
  useEffect(() => {
    console.log("DisplayList item:", item);
    console.log("Date", new Date().toString());
  }, []);

  function dateProcess(startDate: number, endDate: number) {
    const start = new Date(Number(startDate));
    const end = new Date(Number(endDate));
    const now = new Date();

    if (end < now) {
      return 1;
    } else {
      return (
        (now.getTime() - start.getTime()) / (end.getTime() - start.getTime())
      );
    }
  }

  return (
    <>
      <CardContent>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ marginBottom: 8, fontWeight: "600" }}>
            {bankCodeTrans(item.bankShort)}
          </Text>
          <Text>￥{item.amount}</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          <Text style={{ fontSize: 12, color: "#666" }}>
            {/* sqlite会把超过 2^63 的INTEGER认为是TEXT */}
            {new Date(Number(item.startDate)).toLocaleDateString()} -{" "}
            {new Date(Number(item.endDate)).toLocaleDateString()}
          </Text>
          <Text style={{ fontSize: 12, color: "#666" }}>
            总利率: {item.totalRate}%
          </Text>
        </View>
        <Progress
          value={dateProcess(item.startDate, item.endDate)}
          height={6}
        />
      </CardContent>
    </>
  );
}
