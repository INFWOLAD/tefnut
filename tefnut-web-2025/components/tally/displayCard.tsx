import { bankCodeTrans, bankPhotoTrans } from "@/utils/tallyBankCode";
import { Card, CardContent } from "../ui/card";
import { Text } from "../ui/text";
import { View } from "../ui/view";
import { useEffect } from "react";
import { Progress } from "../ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import dayjs from "dayjs";
import BigNumber from "bignumber.js";
import { formatAmount } from "@/utils/formatAmount";

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
          <View style={{ flex: 1, flexDirection: "column" }}>
            <View
              style={{ flexDirection: "row", alignItems: "center", height: 22 }}
            >
              <Avatar size={16}>
                <AvatarImage
                  source={{
                    uri: bankPhotoTrans(item.bankShort),
                  }}
                />
                <AvatarFallback>{item.bankShort}</AvatarFallback>
              </Avatar>
              <Text
                style={{
                  fontWeight: "400",
                  marginLeft: 4,
                  lineHeight: 16,
                  fontSize: 14,
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: "#666",
                  marginRight: 4,
                  lineHeight: 18,
                }}
              >
                当前收益
              </Text>
              <Text
                style={{
                  color: "#fc3f3fff",
                  fontSize: 16,
                }}
              >
                {formatAmount(
                  (
                    BigNumber(item.amount)
                      .multipliedBy(item.totalRate)
                      .dividedBy(36500)
                      .toNumber() *
                    dayjs(Math.min(Number(item.endDate), Date.now())).diff(
                      dayjs(Number(item.startDate)),
                      "day"
                    )
                  ).toFixed(2)
                )}
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: "#666" }}>
              {dayjs(Number(item.endDate)).isAfter(dayjs())
                ? `${dayjs(Number(item.endDate)).format("YYYY-MM-DD")} 到期`
                : `⚠️已到期`}
            </Text>
          </View>
          <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
            <Text
              style={{
                fontSize: 8,
                color: "#666",
                lineHeight: 8,
                marginTop: 4,
              }}
            >
              存单本金
            </Text>
            <Text
              style={{
                fontWeight: "600",
                fontSize: 22,
                lineHeight: 24,
              }}
            >
              ￥{formatAmount(item.amount)}
            </Text>
            <Text style={{ fontSize: 12, color: "#666" }}>
              年利率: {item.totalRate}%
            </Text>
          </View>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        ></View>
        <Progress
          value={dateProcess(item.startDate, item.endDate)}
          height={4}
        />
      </CardContent>
    </>
  );
}
