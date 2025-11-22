import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BtManageScreen() {
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
      </ScrollView>
    </SafeAreaView>
  );
}
