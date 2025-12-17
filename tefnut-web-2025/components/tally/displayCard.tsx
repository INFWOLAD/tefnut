import { bankCodeTrans, bankPhotoTrans } from "@/utils/tallyBankCode";
import { Card, CardContent } from "../ui/card";
import { Text } from "../ui/text";
import { View } from "../ui/view";
import { useEffect } from "react";
import { Progress } from "../ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";

interface DisplayCardProps {
  item: any;
  latestUUID?: string;
}

export default function DisplayCard({ item, latestUUID }: DisplayCardProps) {
  useEffect(() => {
    console.log("DisplayList item:", item);
    console.log("Date", new Date().toString());
  }, []);

  function dateProcess(startDate: number, endDate: number) {
    const start = new Date(Number(startDate));
    const end = new Date(Number(endDate));
    const now = new Date();

    if (end < now) {
      return 100;
    } else {
      const percent =
        (now.getTime() - start.getTime()) / (end.getTime() - start.getTime());
      // console.log("dateProcess:", percent);
      return percent * 100;
    }
  }

  return (
    <>
      <CardContent>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View
            style={{ flexDirection: "row", alignItems: "center", height: 32 }}
          >
            <Avatar size={24}>
              <AvatarImage
                source={{
                  uri: bankPhotoTrans(item.bankShort),
                }}
              />
              <AvatarFallback>{item.bankShort}</AvatarFallback>
            </Avatar>
            <Text
              style={{
                fontWeight: "600",
                marginLeft: 8,
                lineHeight: 32,
              }}
            >
              {bankCodeTrans(item.bankShort)}
            </Text>
            {latestUUID === item.uuid && (
              <Badge
                style={{
                  height: 18,
                  paddingHorizontal: 6,
                  paddingVertical: 0,
                  marginLeft: 6,
                }}
                textStyle={{ fontSize: 10 }}
              >
                NEW
              </Badge>
            )}
          </View>
          <Text
            style={{
              fontWeight: "600",
              marginLeft: 8,
              lineHeight: 32,
            }}
          >
            ￥{item.amount}
          </Text>
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
