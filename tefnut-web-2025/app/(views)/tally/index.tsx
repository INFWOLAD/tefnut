import { Icon } from "@/components/ui/icon";
import { Link } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { router, useNavigation } from "expo-router";
import { Compass, Plus } from "lucide-react-native";
import { useEffect } from "react";
import { Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";
import { useBottomSheet, BottomSheet } from "@/components/ui/bottom-sheet";
import AddItem from "@/components/tally/addItem";
import { Button } from "@/components/ui/button";
import { useTallyStore } from "@/stores/tally/tally";

export default function TallyIndex() {
  const navigator = useNavigation();
  const db = SQLite.openDatabaseSync("app.db");
  const addSheet = useBottomSheet();
  const storeAddItem = useTallyStore((state) => state.addItems);
  const sql = `
  INSERT INTO tallyDetail (
    uuid,
    bankShort,
    startDate,
    endDate,
    cashRate,
    extraRate,
    totalRate,
    amount,
    ext
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

  useEffect(() => {
    // 初始建表
    db.execAsync(`
      CREATE TABLE IF NOT EXISTS tallyDetail (
        uuid TEXT PRIMARY KEY,
        bankShort TEXT,
        startDate TEXT,
        endDate TEXT,
        cashRate TEXT,
        extraRate TEXT,
        totalRate TEXT,
        amount TEXT,
        ext TEXT
      );
    `);
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
  }, []);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, paddingTop: 50, paddingHorizontal: 20 }}
    >
      <BottomSheet isVisible={addSheet.isVisible} onClose={addSheet.close}>
        <AddItem />
      </BottomSheet>
      <Button
        onPress={() => {
          const uuid = Date.now().toString();
          db.runAsync(sql, [
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
        }}
      >
        添加
      </Button>
    </SafeAreaView>
  );
}
