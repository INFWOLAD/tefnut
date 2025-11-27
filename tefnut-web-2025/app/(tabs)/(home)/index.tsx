import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { useColor } from "@/hooks/useColor";
import { useRouter } from "expo-router";
import { useStore as useBtStore } from "@/stores/bt/btInfo";
import { showSuccessAlert } from "@/components/ui/alert";

export default function HomeScreen() {
  const green = useColor("green");
  const muted = useColor("muted");
  const router = useRouter();
  const btloginfo = useBtStore();
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
          console.log("Navigating to /bt/manage");
          btloginfo.loggedIn
            ? router.navigate("/bt/manage")
            : showSuccessAlert(
                "请确认登录状态",
                "您可以在设置-BT设置中登入以使用该功能",
                () => console.log("未登录完成")
              );
        }}
      >
        QBittorrent管理
      </Button>
    </View>
  );
}
