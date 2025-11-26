import { Stack } from "expo-router";
import { useColor } from "@/hooks/useColor";
import { Platform, useColorScheme } from "react-native";
import { Text } from "@/components/ui/text";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { ToastProvider } from "@/components/ui/toast";
export default function SettingsLayout() {
  const theme = useColorScheme();
  const text = useColor("text");
  const background = useColor("background");

  return (
    <ToastProvider>
      <Stack
        screenOptions={{
          headerLargeTitle: true,
          headerLargeTitleShadowVisible: false,
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
          name="index"
          options={{
            title: "设置",
            headerTitle: () =>
              Platform.OS === "android" ? (
                <Text variant="heading">设置</Text>
              ) : undefined,
          }}
        />
      </Stack>
    </ToastProvider>
  );
}
