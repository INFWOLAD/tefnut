import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { useBottomSheet, BottomSheet } from "@/components/ui/bottom-sheet";
import { Plus, Zap } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";
import { useStore } from "@/stores/bt/bt";
import { request } from "@/utils/request";

export default function BtManageScreen() {
  const { toast } = useToast();
  const navigation = useNavigation();
  const magnetBottomSheet = useBottomSheet();

  // 磁力链接输入内容
  const [magnet, setMagnet] = useState("");

  // zustand
  const btStore = useStore();

  useEffect(() => {
    console.log("Current URL from store:", btStore.url);
    navigation.setOptions({
      title: "首页",
      headerRight: () => (
        <>
          {/* 直接读取剪贴板添加 */}
          <Pressable
            onPress={() => {
              console.log("Add torrent button pressed");
              magnetBottomSheet.open();
            }}
            style={{
              padding: 6,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 20,
            }}
          >
            <Icon name={Zap} size={24} />
          </Pressable>
          {/* 手动添加 */}
          <Pressable
            onPress={() => {
              console.log("Add torrent button pressed");
              magnetBottomSheet.open();
            }}
            style={{
              padding: 6,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon name={Plus} size={24} />
          </Pressable>
        </>
      ),
    });
  }, []);

  // 添加磁力
  async function handleSubmit() {
    // 处理提交逻辑
    console.log("Submitted:", { magnet });
    const formData = new FormData();
    formData.append("urls", magnet);
    magnetBottomSheet.close();
    // 从zustand中取login的url
    const response = await request({
      url: `${btStore.url}/api/v2/torrents/add`,
      method: "POST",
      data: formData,
      toast,
    });
    console.log("Add torrent response:", response);
  }

  return (
    <SafeAreaView>
      <ScrollView
        style={{
          flex: 1,
          padding: 24,
          paddingTop: 100,
        }}
      >
        <View style={{ gap: 16 }}>
          <Text>进入管理页面</Text>
        </View>
        <BottomSheet
          isVisible={magnetBottomSheet.isVisible}
          onClose={magnetBottomSheet.close}
          title="新增磁力下载"
          snapPoints={[0.6, 0.8]}
          enableBackdropDismiss={true}
        >
          <View style={{ gap: 20 }}>
            <View style={{ gap: 12 }}>
              <Input
                value={magnet}
                onChangeText={setMagnet}
                variant="outline"
                placeholder="Enter your magnet link"
              />
            </View>
            <View
              style={{
                flex: 1,
                width: "100%",
                flexDirection: "row",
                gap: 12,
                marginTop: 12,
              }}
            >
              <Button
                variant="outline"
                onPress={magnetBottomSheet.close}
                style={{ flex: 1 }}
              >
                取消
              </Button>
              <Button onPress={handleSubmit} style={{ flex: 1 }}>
                添加
              </Button>
            </View>
          </View>
        </BottomSheet>
      </ScrollView>
    </SafeAreaView>
  );
}
