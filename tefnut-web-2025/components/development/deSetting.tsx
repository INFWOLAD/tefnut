import { Card } from "@/components/ui/card";
import { View } from "@/components/ui/view";
import { Text } from "@/components/ui/text";
import { Separator } from "@/components/ui/separator";
import { Pressable } from "react-native";
import { useColor } from "@/hooks/useColor";
import { router } from "expo-router";

export default function DeSetting() {
  const canSelect = useColor("blue");
  const errorColor = useColor("red");

  return (
    <>
      <View style={{ gap: 4, marginTop: 8 }}>
        <Card>
          <View
            style={{
              marginVertical: 2,
            }}
          >
            <Pressable
              onPress={() => {
                router.push("/development/debugDB");
              }}
            >
              <Text style={{ color: canSelect }}>SQL调试</Text>
            </Pressable>
          </View>
        </Card>
      </View>
    </>
  );
}
