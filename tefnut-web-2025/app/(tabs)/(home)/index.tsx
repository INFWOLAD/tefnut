import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Link } from "@/components/ui/link";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useColor } from "@/hooks/useColor";
import { Terminal } from "lucide-react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const green = useColor("green");
  const muted = useColor("muted");
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        gap: 22,
        padding: 20,
        justifyContent: "center",
      }}
    >
      <Text
        variant="heading"
        style={{
          textAlign: "center",
        }}
      >
        Tefnut (Beta)
      </Text>

      {/* <Link asChild href="/sheet">
        <Button>Open Components Sheet</Button>
      </Link> */}
      <Button
        onPress={() => {
          console.log("Navigating to /bt/login");
          router.navigate("/bt/login");
        }}
      >
        QBittorrent管理
      </Button>
    </View>
  );
}
