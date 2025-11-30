import { Card } from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
  ComboboxValue,
  OptionType,
} from "@/components/ui/combobox";
import { Picker } from "@/components/ui/picker";
import { BottomSheet, useBottomSheet } from "@/components/ui/bottom-sheet";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { showSuccessAlert, showErrorAlert } from "@/components/ui/alert";
import * as SecureStore from "expo-secure-store";
import { use, useEffect, useRef, useState } from "react";
import { useStore as useBtStore } from "@/stores/bt/btInfo";
import { useBtLogin } from "@/hooks/useBtLogin";
import { createRequestController, request } from "@/utils/request";
import { TextInput, Pressable } from "react-native";
import { useColor } from "@/hooks/useColor";
import { useStore } from "@/stores/bt/btInfo";
import { BtLoginSheet } from "@/components/bt/btLoginSheet";
import { ListOrdered } from "lucide-react-native";

const listOrderOptions: Array<{ label: string; value: string }> = [
  { label: "预计完成时间", value: "eta" },
  { label: "下载速度", value: "dlspeed" },
  { label: "分享率", value: "ratio" },
  { label: "名称", value: "name" },
  { label: "状态", value: "state" },
  { label: "活动时间", value: "time_active" },
];

export default function BtSetting() {
  // bt 登录hook
  const { btLogin, loading } = useBtLogin();
  // bt zustand
  const btStore = useStore();
  // bt 选择框搜索和选中
  const [btSearch, setBtSearch] = useState<OptionType | null>(null);
  const [localOrder, setLocalOrder] = useState<string>("time_active");
  // bt 底部弹出框
  const btSheet = useBottomSheet();
  // bt zustand
  const btloginfo = useBtStore();
  // textinput组件用颜色
  const themeColor = useColor("text");
  const disableColor = useColor("textMuted");
  const canSelect = useColor("blue");
  const errorColor = useColor("red");
  // 计时器id，防止重复生成
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // 尝试从安全存储中获取已保存的凭据
    (async () => {
      // bt以string存储的用户信息列表和默认用户
      const userString = await SecureStore.getItemAsync("bt_userList");
      //   以uuid存储当前选择用户
      const userDefaultUuid = await SecureStore.getItemAsync("bt_selectedUuid");
      const userList = userString ? JSON.parse(userString) : [];
      btStore.setUserList(userList);
      if (userDefaultUuid) {
        btStore.setSelectedUuid(userDefaultUuid);
        const selectedUser = userList.find(
          (u: any) => u.uuid === userDefaultUuid
        );
        btStore.setSelectedUser(selectedUser);

        console.log("Loaded BT users from storage:", {
          userList,
          userDefaultUuid,
        });
        // 如果有默认用户则尝试自动登录
        const un = selectedUser ? selectedUser.username : "";
        const pw = selectedUser ? selectedUser.password : "";
        const url = selectedUser ? selectedUser.url : "";
        console.log("Retrieved credentials:", { un, pw, url });
        if (un && pw && url) {
          // 请求前重新生成controller防止全局失效
          const localController = createRequestController();
          const result = await btLogin(url, un, pw, localController, true);
          result && btloginfo.setLoggedIn(true);
        }
      }
    })();
    // 拉起页面加载计时器，页面销毁清除计时器
    startInterval();
    // 卸载组件时执行清理
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
  useEffect(() => {
    (async () => {
      // 根据搜索内容更新选中项
      if (btSearch) {
        console.log("Searching BT user:", btSearch);
        const selected = btStore.userList.find(
          (u: any) => u.uuid === btSearch.value
        );
        // 如果找到了对应用户则尝试重新登录
        if (selected) {
          const localController = createRequestController();
          const result = await btLogin(
            selected.url,
            selected.username,
            selected.password,
            localController,
            true
          );
          // 登录成功放入缓存
          if (result) {
            btloginfo.setLoggedIn(true);
            btStore.setSelectedUuid(selected.uuid);
            btStore.setSelectedUser(selected);
            await SecureStore.setItemAsync("bt_selectedUuid", selected.uuid);
          } else {
            btloginfo.setLoggedIn(false);
          }
          console.log("Selected BT user:", selected);
        }
      }
    })();
  }, [btSearch]);

  useEffect(() => {
    btStore.setListOrder(localOrder as any);
  }, [localOrder]);

  useEffect(() => {
    console.log("BT selected UUID changed:", btStore.selectedUuid);
    setBtSearch(
      btStore.selectedUuid
        ? {
            label: btStore.selectedUser ? btStore.selectedUser.nickname : "",
            value: btStore.selectedUuid ? btStore.selectedUuid : "",
          }
        : null
    );
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    btStore.selectedUuid && startInterval();
  }, [btStore.selectedUuid]);

  // 定时刷新计时器
  async function startInterval() {
    if (!intervalRef.current) {
      // 首次请求拉去任务列表
      intervalRef.current = setInterval(async () => {
        const result = await request({
          // url: `${btUrl.current}/api/v2/sync/maindata?rid=${rid}`,
          url: `${btStore.selectedUser?.url}/api/v2/transfer/info`,
          method: "POST",
          toast: null,
        });
        if (
          result.connection_status !== "connected" &&
          intervalRef.current !== null
        ) {
          btloginfo.setLoggedIn(false);
          // 错误后清理计时器
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        } else if (result.connection_status === "connected") {
          btStore.setTotalDownloadSpeed(result.dl_info_speed);
          btStore.setTotalUploadSpeed(result.up_info_speed);
        }
      }, 2000); // 每2秒拉取一次
    }
  }

  return (
    <>
      <View style={{ gap: 4, marginTop: 8 }}>
        {/* bt 用户选择 */}
        <Combobox value={btSearch} onValueChange={setBtSearch}>
          <ComboboxTrigger>
            <ComboboxValue
              placeholder={
                btStore.selectedUuid
                  ? btStore.userList.find(
                      (u: any) => u.uuid === btStore.selectedUuid
                    )?.nickname
                  : "选择服务器"
              }
            />
          </ComboboxTrigger>
          <ComboboxContent>
            <ComboboxInput placeholder="请输入服务器名称..." />
            <ComboboxList>
              <ComboboxEmpty>
                <Text style={{ color: disableColor, padding: 8 }}>无结果</Text>
              </ComboboxEmpty>
              {btStore.userList.map((user: any) => (
                <ComboboxItem key={user.uuid} value={user.uuid}>
                  {user.nickname}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
        <Card>
          {btStore.selectedUuid && (
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginVertical: 2,
                  height: 22,
                }}
              >
                <Text>连接状态</Text>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Text>
                    {loading
                      ? "验证中"
                      : btloginfo.loggedIn
                        ? "已连接"
                        : "无连接"}
                  </Text>
                  <Badge
                    variant={
                      loading
                        ? "outline"
                        : btloginfo.loggedIn
                          ? "success"
                          : "destructive"
                    }
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 8,
                      paddingHorizontal: 0,
                      paddingVertical: 0,
                    }}
                  >
                    <View />
                  </Badge>
                </View>
              </View>
              <Separator style={{ marginVertical: 8 }} />
            </>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginVertical: 2,
            }}
          >
            <Text>主页地址</Text>
            <TextInput
              value={btStore.defaultUrl}
              onChangeText={btStore.setDefaultUrl}
              keyboardType="url"
              style={{
                color: themeColor,
                fontSize: 16,
                flex: 1,
                textAlign: "right",
                padding: 0,
              }}
            ></TextInput>
          </View>
          <Separator style={{ marginVertical: 8 }} />
          <View
            style={{
              flexDirection: "row",
              marginVertical: 2,
            }}
          >
            {/* <Text>列表排序方式</Text> */}
            <Picker
              options={listOrderOptions}
              value={localOrder}
              label="列表排序方式"
              onValueChange={setLocalOrder}
              placeholder="Select setting..."
              variant="group"
              inputStyle={{ flex: 1, textAlign: "right" }}
              labelStyle={{ color: themeColor }}
            />
          </View>
          <Separator style={{ marginVertical: 8 }} />
          <View
            style={{
              marginVertical: 2,
            }}
          >
            <Pressable onPress={() => btSheet.open()}>
              <Text style={{ color: canSelect }}>添加新服务器</Text>
            </Pressable>
            {btStore.selectedUuid && (
              <>
                <Separator style={{ marginVertical: 8 }} />
                <Pressable
                  onPress={() => {
                    if (btStore.selectedUuid) {
                      const updatedUserList = btStore.userList.filter(
                        (u: any) => u.uuid !== btStore.selectedUuid
                      );
                      btStore.setUserList(updatedUserList);
                      SecureStore.setItemAsync(
                        "bt_userList",
                        JSON.stringify(updatedUserList)
                      );
                      setBtSearch(null);
                      btStore.setSelectedUuid("");
                      SecureStore.deleteItemAsync("bt_selectedUuid");
                      btloginfo.setLoggedIn(false);
                    }
                  }}
                >
                  <Text style={{ color: errorColor }}>删除当前服务器</Text>
                </Pressable>
              </>
            )}
          </View>
        </Card>
      </View>
      <BottomSheet
        isVisible={btSheet.isVisible}
        onClose={() => btSheet.close()}
        snapPoints={[0.5, 0.6]}
        enableBackdropDismiss={true}
      >
        <BtLoginSheet sheetRef={btSheet} />
      </BottomSheet>
    </>
  );
}
