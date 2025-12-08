import { Icon } from "@/components/ui/icon";
import { Link } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { router, useNavigation } from "expo-router";
import { Compass, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";
import { useBottomSheet, BottomSheet } from "@/components/ui/bottom-sheet";
import AddItem from "@/components/tally/addItem";
import { Button } from "@/components/ui/button";
import { useTallyStore } from "@/stores/tally/tally";
import { ADDITEMS, CREATTABLE, QUERYALL } from "@/utils/tallySQL";
import DisplayList from "@/components/tally/displayCard";
import { Card } from "@/components/ui/card";

export default function TallyIndex() {
  const navigator = useNavigation();
  const db = SQLite.openDatabaseSync("app.db");
  const addSheet = useBottomSheet();
  const storeAddItem = useTallyStore((state) => state.addItems);
  const storeSaveAddItem = useTallyStore((state) => state.saveAddItem);
  const storeClearAddItem = useTallyStore((state) => state.clearAddItem);
  const [itemsList, setItemsList] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      // 初始建表
      await db.execAsync(CREATTABLE);
      navigator.setOptions({
        headerRight: () => {
          return (
            <>
              {/* 添加 */}
              <Pressable
                onPress={() => {
                  addSheet.open();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                style={{
                  padding: 6,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon name={Plus} size={24} />
              </Pressable>
            </>
          );
        },
      });
      await refreshList();
    })();
  }, []);

  async function refreshList() {
    const data = await db.getAllAsync(QUERYALL);
    setItemsList(data);
  }

  useEffect(() => {}, []);
  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, paddingTop: 50, paddingHorizontal: 20 }}
    >
      {itemsList.map((item) => (
        <Card key={item.uuid} style={{ marginBottom: 12 }}>
          <DisplayList item={item} />
        </Card>
      ))}
      <BottomSheet
        isVisible={addSheet.isVisible}
        onClose={addSheet.close}
        snapPoints={[0.6]}
      >
        <AddItem />
        <Button
          onPress={async () => {
            const uuid = Date.now().toString();
            console.log("添加存单：", storeAddItem);
            await db.runAsync(ADDITEMS, [
              uuid,
              storeAddItem.bankShort,
              storeAddItem.startDate,
              storeAddItem.endDate,
              storeAddItem.cashRate,
              storeAddItem.extraRate,
              storeAddItem.totalRate,
              storeAddItem.amount,
              "",
            ]);
            !storeSaveAddItem && storeClearAddItem();
            await refreshList();
            addSheet.close();
          }}
          style={{ marginTop: 16 }}
          disabled={
            !storeAddItem.bankShort ||
            !storeAddItem.amount ||
            !storeAddItem.startDate ||
            !storeAddItem.endDate ||
            !storeAddItem.totalRate ||
            !storeAddItem.cashRate ||
            !storeAddItem.extraRate
          }
        >
          添加
        </Button>
      </BottomSheet>
    </SafeAreaView>
  );
}
