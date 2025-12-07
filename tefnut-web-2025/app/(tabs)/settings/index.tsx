import { ScrollView } from "@/components/ui/scroll-view";
import { View } from "@/components/ui/view";
import * as Application from "expo-application";
import { Text } from "@/components/ui/text";
import { AvoidKeyboard } from "@/components/ui/avoid-keyboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColor } from "@/hooks/useColor";
import BtSetting from "@/components/bt/btSetting";
import DeSetting from "@/components/development/deSetting";
import Constants from "expo-constants";

export default function SettingsScreen() {
  // 包版本相关
  const appVersion = Application.nativeApplicationVersion || "dev";
  const buildNumber = Application.nativeBuildVersion;
  const env = Constants.expoConfig?.extra?.APP_ENV;
  // textinput组件用颜色
  const themeColor = useColor("text");
  const disableColor = useColor("textMuted");
  const canSelect = useColor("blue");

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["right", "top", "left"]}>
      <ScrollView
        style={{
          flex: 1,
          paddingTop: 24,
          paddingHorizontal: 8,
        }}
      >
        <Text
          style={{
            color: themeColor,
            opacity: 0.6,
            marginLeft: 4,
            fontSize: 14,
          }}
        >
          bt相关设置
        </Text>
        {/* BT相关设置 */}
        <BtSetting />
        {env === "development" && (
          <>
            <Text
              style={{
                color: themeColor,
                opacity: 0.6,
                marginLeft: 4,
                paddingTop: 24,
                fontSize: 14,
              }}
            >
              开发者选项
            </Text>
            <DeSetting />
          </>
        )}

        <Text
          style={{
            color: themeColor,
            opacity: 0.3,
            textAlign: "center",
            fontSize: 14,
            paddingVertical: 16,
          }}
        >
          Tefnut {appVersion} ({buildNumber})
          {(env !== "production" && env) || ""}
        </Text>
      </ScrollView>

      {/* 键盘规避with animate */}
      <AvoidKeyboard />
    </SafeAreaView>
  );
}
