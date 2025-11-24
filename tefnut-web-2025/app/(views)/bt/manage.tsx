import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useBottomSheet, BottomSheet } from "@/components/ui/bottom-sheet";
import { Plus, Zap } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable } from "react-native";

export default function BtManageScreen() {
  const navigation = useNavigation();
  const magnetBottomSheet = useBottomSheet();

  // 磁力链接输入内容
  const [magnet, setMagnet] = useState("");

  useEffect(() => {
    navigation.setOptions({
      title: "首页",
      headerRight: () => (
        <>
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

  function handleSubmit() {
    // 处理提交逻辑
    console.log("Submitted:", { magnet });
    magnetBottomSheet.close();
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
