import { router, Stack } from "expo-router";
import { Platform, useColorScheme } from "react-native";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { useColor } from "@/hooks/useColor";
import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Pressable } from "react-native";
import { Home, LogIn } from "lucide-react-native";
import { ToastProvider } from "@/components/ui/toast";

export default function BtLayout() {
  const theme = useColorScheme();
  const text = useColor("text");
  const background = useColor("background");
  const primary = useColor("primary");

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
          name="index"
          options={{
            title: "",
            headerTitle: () =>
              Platform.OS === "android" ? (
                <Text variant="heading">组件页</Text>
              ) : undefined,
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
      </Stack>
    </ToastProvider>
  );
}
