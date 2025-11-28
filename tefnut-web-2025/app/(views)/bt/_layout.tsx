import { router, Stack } from "expo-router";
import { Platform, useColorScheme } from "react-native";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useColor } from "@/hooks/useColor";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "react-native";
import { Home } from "lucide-react-native";
import { ToastProvider } from "@/components/ui/toast";
import { osName } from "expo-device";
import { Colors } from "@/theme/colors";
export default function BtLayout() {
  const theme = useColorScheme();
  const text = useColor("text");
  const background = useColor("background");
  const primary = useColor("primary");
  const colorScheme = useColorScheme() || "light";

  return (
    <ToastProvider>
      <Stack
        screenOptions={{
          headerLargeTitle: false,
          headerLargeTitleShadowVisible: false,
          headerTransparent: true,
          headerTintColor: text,
          headerBlurEffect: isLiquidGlassAvailable()
            ? undefined
            : theme === "dark"
              ? "systemMaterialDark"
              : "systemMaterialLight",
          headerStyle: {
            backgroundColor: isLiquidGlassAvailable()
              ? "transparent"
              : background,
          },
        }}
      >
        <Stack.Screen
          name="manage"
          options={{
            title: "",
            headerTitle: undefined,
            // 安卓header透明时，会把 header 作为“覆盖层”渲染在内容之上
            headerTransparent: Platform.OS === "ios" ? true : false,
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  router.dismissAll();
                  router.replace("/");
                }}
                style={{
                  padding: 6,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon name={Home} size={24} color={primary} />
              </Pressable>
            ),
          }}
        />
        <Stack.Screen
          name="btSheet"
          options={{
            headerShown: false,
            sheetGrabberVisible: true,
            contentStyle: {
              backgroundColor: isLiquidGlassAvailable()
                ? "transparent"
                : colorScheme === "dark"
                  ? Colors.dark.card
                  : Colors.light.card,
            },
            headerTransparent: Platform.OS === "ios" ? true : false,
            headerLargeTitle: false,
            title: "",
            presentation:
              Platform.OS === "ios"
                ? isLiquidGlassAvailable() && osName !== "iPadOS"
                  ? "formSheet"
                  : "modal"
                : "modal",
            sheetInitialDetentIndex: 0,
            headerStyle: {
              backgroundColor:
                Platform.OS === "ios"
                  ? "transparent"
                  : colorScheme === "dark"
                    ? Colors.dark.card
                    : Colors.light.card,
            },
            headerBlurEffect: isLiquidGlassAvailable()
              ? undefined
              : colorScheme === "dark"
                ? "dark"
                : "light",
          }}
        />
      </Stack>
    </ToastProvider>
  );
}
