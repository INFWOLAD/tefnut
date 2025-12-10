import { Icon } from "@/components/ui/icon";
import { Link } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { router, useNavigation } from "expo-router";
import { Compass, ListOrdered, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";
import { useBottomSheet, BottomSheet } from "@/components/ui/bottom-sheet";
import AddItem from "@/components/tally/addItem";
import { Button } from "@/components/ui/button";
import { useTallyStore } from "@/stores/tally/tally";
import { ADDITEMS, CREATTABLE, DELETEITEM, QUERYALL } from "@/utils/tallySQL";
import DisplayList from "@/components/tally/displayCard";
import { Card } from "@/components/ui/card";
import DisplayCard from "@/components/tally/displayCard";
import { ActionSheet } from "@/components/ui/action-sheet";
import DisPlaySheet from "@/components/tally/displaySheet";

export default function TallyIndex() {
  const navigator = useNavigation();
  const db = SQLite.openDatabaseSync("app.db");
  const addSheet = useBottomSheet();
  const infoSheet = useBottomSheet();
  const storeAddItem = useTallyStore((state) => state.addItems);
  const storeSaveAddItem = useTallyStore((state) => state.saveAddItem);
  const storeClearAddItem = useTallyStore((state) => state.clearAddItem);
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [operatingItem, setOperatingItem] = useState<any>({});

  const orderOptions = [
    {
      title: "银行",
      onPress: () => {
        setItemsList(
          itemsList.sort((a, b) => {
            return a.bankShort.localeCompare(b.bankShort);
          })
        );
        setActionSheetVisible(false);
      },
    },
    {
      title: "利率",
      onPress: () => {
        itemsList.sort((a, b) => {
          return b.totalRate - a.totalRate;
        });
        setActionSheetVisible(false);
      },
    },
    {
      title: "到期时间",
      onPress: () => {
        itemsList.sort((a, b) => {
          return a.endDate - b.endDate;
        });
        setActionSheetVisible(false);
      },
    },
    {
      title: "金额",
      onPress: () => {
        itemsList.sort((a, b) => {
          return b.amount - a.amount;
        });
        setActionSheetVisible(false);
      },
    },
  ];

  useEffect(() => {
    (async () => {
      // 初始建表
      await db.execAsync(CREATTABLE);
      navigator.setOptions({
        headerRight: () => {
          return (
            <>
              {/* 排序 */}
              <Pressable
                onPress={() => {
                  setActionSheetVisible(true);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                style={{
                  padding: 6,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 20,
                }}
              >
                <Icon name={ListOrdered} size={24} />
              </Pressable>
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

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, paddingTop: 60, paddingHorizontal: 20 }}
    >
      {itemsList.map((item) => (
        <Card key={item.uuid} style={{ marginBottom: 12 }}>
          <Pressable
            onPress={() => {
              setOperatingItem(item);
              infoSheet.open();
            }}
          >
            <DisplayCard item={item} />
          </Pressable>
        </Card>
      ))}
      <ActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        title="选择排序方式"
        message=""
        options={orderOptions}
      />
      {/* 存单详情 */}
      <BottomSheet
        isVisible={infoSheet.isVisible}
        onClose={async () => {
          infoSheet.close();
        }}
        snapPoints={[0.5]}
      >
        <DisPlaySheet item={operatingItem} />
        <Button
          onPress={async () => {
            await db.runAsync(DELETEITEM, [operatingItem.uuid]);
            infoSheet.close();
            await refreshList();
          }}
          style={{ marginTop: 16 }}
          variant="destructive"
        >
          删除
        </Button>
      </BottomSheet>
      {/* 存单添加 */}
      <BottomSheet
        isVisible={addSheet.isVisible}
        onClose={async () => {
          addSheet.close();
          !storeSaveAddItem && storeClearAddItem();
          await refreshList();
        }}
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
            addSheet.close();
            !storeSaveAddItem && storeClearAddItem();
            await refreshList();
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
