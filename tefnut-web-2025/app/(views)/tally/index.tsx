import { Icon } from "@/components/ui/icon";
import { useNavigation } from "expo-router";
import { ListOrdered, Plus } from "lucide-react-native";
import { useEffect, useState } from "react";
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
  const addSheet = useBottomSheet();
  const infoSheet = useBottomSheet();
  const safeInsets = useSafeAreaInsets();
  const storeAddItem = useTallyStore((state) => state.addItems);
  const setStoreAddItem = useTallyStore((state) => state.setAddItem);
  const storeClearAddItem = useTallyStore((state) => state.clearAddItem);
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [actionSheetVisible, setActionSheetVisible] = useState(false);
  const [modifyFlag, setModifyFlag] = useState(false);
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
                infoSheet.open();
              }}
            >
              <DisplayCard item={item} />
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
        isVisible={infoSheet.isVisible}
        onClose={async () => {
          infoSheet.close();
        }}
        snapPoints={[0.6]}
      >
        <DisPlaySheet item={operatingItem} />
        <Button
          onPress={async () => {
            const uuid = Date.now().toString();
            console.log("添加存单：", operatingItem);
            await db.runAsync(ADDITEMS, [
              uuid,
              operatingItem.bankShort,
              operatingItem.startDate,
              operatingItem.endDate,
              operatingItem.cashRate,
              operatingItem.extraRate,
              operatingItem.totalRate,
              operatingItem.amount,
              "",
            ]);
            infoSheet.close();
            await refreshList();
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
            infoSheet.close();
            addSheet.open();
          }}
          style={{ marginTop: 16 }}
          variant="default"
        >
          修改
        </Button>
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
          storeClearAddItem();
          await refreshList();
        }}
        snapPoints={[0.6]}
      >
        <AddItem />
        {modifyFlag ? (
          <Button
            onPress={async () => {
              console.log("修改存单：", storeAddItem);
              await db.runAsync(UPDATEITEMS, [
                storeAddItem.bankShort,
                storeAddItem.startDate,
                storeAddItem.endDate,
                storeAddItem.cashRate,
                storeAddItem.extraRate,
                storeAddItem.totalRate,
                storeAddItem.amount,
                "",
                storeAddItem.uuid,
              ]);
              addSheet.close();
              storeClearAddItem();
              setModifyFlag(false);
              await refreshList();
            }}
            style={{ marginTop: 16 }}
          >
            修改
          </Button>
        ) : (
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
              storeClearAddItem();
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
        )}
      </BottomSheet>
    </>
  );
}
