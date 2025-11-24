import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useColor } from "@/hooks/useColor";
import { Code, Eye, Palette, Settings } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";

export default function SettingsScreen() {
  const card = useColor("card");
  const border = useColor("border");
  const primary = useColor("primary");

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        flex: 1,
        gap: 18,
        paddingTop: 96,
        alignItems: "center",
      }}
    >
      <ModeToggle />

      <View
        style={{
          width: "90%",
          marginBottom: 40,
        }}
      >
        <Text
          variant="title"
          style={{
            textAlign: "center",
            marginBottom: 24,
            fontWeight: "700",
          }}
        >
          Tefnut 功能
        </Text>

        <View
          style={{
            gap: 12,
          }}
        >
          {features.map((feature, index) => (
            <Card
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <Icon name={feature.icon} size={24} color={primary} />

              <View
                style={{
                  flex: 1,
                }}
              >
                <Text
                  variant="body"
                  style={{
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  {feature.title}
                </Text>
                <Text variant="caption">{feature.description}</Text>
              </View>
            </Card>
          ))}
        </View>
        <Button
          onPress={() => {
            SecureStore.setItemAsync("bt_username", "");
            SecureStore.setItemAsync("bt_password", "");
            SecureStore.setItemAsync("bt_url", "");
          }}
          variant="destructive"
          style={{ marginTop: 12 }}
        >
          QB清空用户信息
        </Button>
      </View>
    </ScrollView>
  );
}

const features = [
  {
    title: "QBittorrent管理",
    description: "设置和管理您的QBittorrent下载任务",
    icon: Eye,
  },
  {
    title: "持续开发中",
    description: "请稍后期待更多功能",
    icon: Code,
  },
];
