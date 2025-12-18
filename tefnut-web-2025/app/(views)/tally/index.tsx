import { Icon } from "@/components/ui/icon";
import { useNavigation } from "expo-router";
import { ListOrdered, Plus } from "lucide-react-native";
import { use, useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as SQLite from "expo-sqlite";
import { useBottomSheet, BottomSheet } from "@/components/ui/bottom-sheet";
import AddItem from "@/components/tally/addItem";
import { Button } from "@/components/ui/button";
import { useTallyStore } from "@/stores/tally/tally";
import {
  ADDITEMS,
  CREATTABLE,
  DELETEITEM,
  QUERYALL,
  UPDATEITEMS,
} from "@/utils/tallySQL";
import { Card } from "@/components/ui/card";
import DisplayCard from "@/components/tally/displayCard";
import { ActionSheet } from "@/components/ui/action-sheet";
import DisPlaySheet from "@/components/tally/displaySheet";
import { ScrollView } from "@/components/ui/scroll-view";
import { Platform } from "react-native";

export default function TallyIndex() {
  const navigator = useNavigation();
  const db = SQLite.openDatabaseSync("app.db");
  const bottomSheet = useBottomSheet();
  const safeInsets = useSafeAreaInsets();
  const storeAddItem = useTallyStore((state) => state.addItems);
  const setStoreAddItem = useTallyStore((state) => state.setAddItem);
  const storeClearAddItem = useTallyStore((state) => state.clearAddItem);
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [modifyFlag, setModifyFlag] = useState(false);
  const [sheetMode, setSheetMode] = useState<"add" | "info">("add");
  const [operatingItem, setOperatingItem] = useState<any>({});
  const [latestItemUUID, setLatestItemUUID] = useState<string>("");

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
                  setSheetMode("add");
                  bottomSheet.open();
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

  useEffect(() => {
    if (latestItemUUID) {
      const timer = setTimeout(() => {
        setLatestItemUUID("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [latestItemUUID]);

  async function refreshList() {
    const data = await db.getAllAsync(QUERYALL);
    setItemsList(data);
  }

  // sheet内添加或修改存单
  async function itemDAO(item: any, action: "add" | "update") {
    const commonParams = [
      item.bankShort,
      item.startDate,
      item.endDate,
      item.cashRate,
      item.extraRate,
      item.totalRate,
      item.amount,
      "",
    ];
    if (action === "add") {
      const uuid = Date.now().toString();
      setLatestItemUUID(uuid);
      await db.runAsync(ADDITEMS, [uuid, ...commonParams]);
    } else {
      setLatestItemUUID(item.uuid);
      await db.runAsync(UPDATEITEMS, [...commonParams, item.uuid]);
    }
    bottomSheet.close();
    storeClearAddItem();
    setModifyFlag(false);
    await refreshList();
  }

  return (
    <>
      <ScrollView
        style={{
          flex: 1,
          paddingTop: safeInsets.top + (Platform.OS === "ios" ? 60 : 0),
          paddingHorizontal: 20,
        }}
      >
        {itemsList.map((item) => (
          <Card key={item.uuid} style={{ marginBottom: 12 }}>
            <Pressable
              onPress={() => {
                setOperatingItem(item);
                setSheetMode("info");
                bottomSheet.open();
              }}
            >
              <DisplayCard item={item} latestUUID={latestItemUUID} />
            </Pressable>
          </Card>
        ))}
      </ScrollView>
      {/* 排序方式 */}
      <ActionSheet
        visible={actionSheetVisible}
        onClose={() => setActionSheetVisible(false)}
        title="选择排序方式"
        message=""
        options={orderOptions}
      />
      {/* 存单详情 */}
      <BottomSheet
        isVisible={bottomSheet.isVisible}
        onClose={async () => {
          bottomSheet.close();
          if (sheetMode === "add") {
            storeClearAddItem();
            await refreshList();
          }
          setModifyFlag(false);
        }}
        snapPoints={sheetMode === "info" ? [0.7] : [0.5]}
      >
        {sheetMode === "info" && (
          <>
            <DisPlaySheet item={operatingItem} />
            <Button
              onPress={async () => {
                console.log("添加存单：", operatingItem);
                await itemDAO(operatingItem, "add");
              }}
              style={{ marginTop: 16 }}
              variant="outline"
            >
              复制
            </Button>
            <Button
              onPress={async () => {
                setStoreAddItem(operatingItem);
                setModifyFlag(true);
                setSheetMode("add");
              }}
              style={{ marginTop: 16 }}
              variant="default"
            >
              修改
            </Button>
            <Button
              onPress={async () => {
                await db.runAsync(DELETEITEM, [operatingItem.uuid]);
                bottomSheet.close();
                await refreshList();
              }}
              style={{ marginTop: 16 }}
              variant="destructive"
            >
              删除
            </Button>
          </>
        )}

        {/* 存单添加 */}
        {sheetMode === "add" && (
          <>
            <AddItem />
            {modifyFlag ? (
              <Button
                onPress={async () => {
                  console.log("修改存单：", storeAddItem);
                  await itemDAO(storeAddItem, "update");
                }}
                style={{ marginTop: 16 }}
              >
                修改
              </Button>
            ) : (
              <Button
                onPress={async () => {
                  console.log("添加存单：", storeAddItem);
                  await itemDAO(storeAddItem, "add");
                }}
                style={{ marginTop: 16 }}
              >
                添加
              </Button>
            )}
          </>
        )}
      </BottomSheet>
    </>
  );
}
