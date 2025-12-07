import { Icon } from "@/components/ui/icon";
import { Link } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { router, useNavigation } from "expo-router";
import { Compass, Plus } from "lucide-react-native";
import { useEffect } from "react";
import { Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TallyIndex() {
  const navigator = useNavigation();

  useEffect(() => {
    navigator.setOptions({
      headerRight: () => {
        return (
          <>
            {/* 添加 */}
            <Pressable
              onPress={() => {}}
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
  }, []);

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, paddingTop: 50, paddingHorizontal: 20 }}
    >
      <Text>Tally View</Text>
    </SafeAreaView>
  );
}
