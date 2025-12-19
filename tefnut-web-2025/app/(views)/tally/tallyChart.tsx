import { PieChart } from "@/components/charts/pie-chart";
import { ChartContainer } from "@/components/charts/chart-container";
import React, { useEffect } from "react";
import * as SQLite from "expo-sqlite";
import { ScrollView } from "@/components/ui/scroll-view";
import { bankInfo } from "@/utils/tallyBankCode";
import { LIST_VIA_BANK } from "@/utils/tallySQL";

export default function TallyChart() {
  const db = SQLite.openDatabaseSync("app.db");
  const totalInfo: Array<any> = Object.keys(bankInfo);
  const pieData: Array<{ label: string; value: number }> = [];

  useEffect(() => {
    (async () => {
      totalInfo.forEach(async (item) => {
        const itemList = await db.getAllAsync(LIST_VIA_BANK, item);
        console.log("itemList for bank", item, itemList);
        if (itemList && itemList.length > 0) {
          const totalAmount = (
            itemList as Array<{ amount?: number | string }>
          ).reduce((sum, current) => sum + Number(current.amount ?? 0), 0);
          pieData.push({ label: item, value: totalAmount });
        }
      });
    })();
  }, []);

  return (
    <ScrollView>
      <ChartContainer
        title="各银行存款占比"
        description="Quarterly performance metrics by department"
      >
        <PieChart
          data={pieData}
          config={{
            height: 300,
            showLabels: true,
            animated: true,
            duration: 1000,
          }}
        />
      </ChartContainer>
    </ScrollView>
  );
}
