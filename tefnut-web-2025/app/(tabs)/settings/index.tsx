import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollView } from "@/components/ui/scroll-view";
import { View } from "@/components/ui/view";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AvoidKeyboard } from "@/components/ui/avoid-keyboard";
import { Lock, User, Link } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { useStore as useBtStore } from "@/stores/bt/btInfo";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBtLogin } from "@/hooks/useBtLogin";
import { createRequestController } from "@/utils/request";
import { TextInput } from "react-native";
import { useColor } from "@/hooks/useColor";
import { useStore } from "@/stores/bt/btInfo";

export default function SettingsScreen() {
  // 登录hook
  const { btLogin, loading } = useBtLogin();
  // bt zustand
  const btStore = useStore();
  // 登录信息三要素
  const [logUrl, setLogUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // bt zustand
  const btloginfo = useBtStore();
  // textinput组件用颜色
  const themeColor = useColor("text");
  const disableColor = useColor("textMuted");
  // 请求中断
  const [controller, setController] = useState(createRequestController());

  useEffect(() => {
    // 尝试从安全存储中获取已保存的凭据
    (async () => {
      const un = await SecureStore.getItemAsync("bt_username");
      const pw = await SecureStore.getItemAsync("bt_password");
      const url = await SecureStore.getItemAsync("bt_url");
      console.log("Retrieved credentials:", { un, pw, url });
      if (un && pw && url) {
        setLogUrl(url);
        setUsername(un);
        // 请求前重新生成controller防止全局失效
        const localController = createRequestController();
        setController(localController);
        const result = await btLogin(url, un, pw, localController, true);
        result && btloginfo.setLoggedIn(true);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{
          flex: 1,
          paddingTop: 24,
          paddingHorizontal: 8,
        }}
      >
        <View style={{ gap: 4, marginTop: 8 }}>
          <Card>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                margin: 4,
              }}
            >
              <Text>登录状态</Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text>
                  {loading ? "登陆中" : btloginfo.loggedIn ? "在线" : "离线"}
                </Text>
                <Badge
                  variant={
                    loading
                      ? "outline"
                      : btloginfo.loggedIn
                        ? "success"
                        : "destructive"
                  }
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: 8,
                    paddingHorizontal: 0,
                    paddingVertical: 0,
                  }}
                >
                  <View />
                </Badge>
              </View>
            </View>
            <Separator style={{ marginVertical: 8 }} />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                margin: 4,
              }}
            >
              <Text>登录地址</Text>
              <TextInput
                value={logUrl}
                onChangeText={setLogUrl}
                keyboardType="url"
                editable={!btloginfo.loggedIn}
                style={{
                  color: btloginfo.loggedIn ? disableColor : themeColor,
                  fontSize: 16,
                  flex: 1,
                  textAlign: "right",
                }}
              ></TextInput>
            </View>
            <Separator style={{ marginVertical: 8 }} />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                margin: 4,
              }}
            >
              <Text>用户名</Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                keyboardType="name-phone-pad"
                editable={!btloginfo.loggedIn}
                style={{
                  color: btloginfo.loggedIn ? disableColor : themeColor,
                  fontSize: 16,
                  flex: 1,
                  textAlign: "right",
                }}
              ></TextInput>
            </View>
            {!btloginfo.loggedIn && (
              <>
                <Separator style={{ marginVertical: 8 }} />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    margin: 4,
                  }}
                >
                  <Text>密码</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    keyboardType="visible-password"
                    editable={!btloginfo.loggedIn}
                    style={{
                      color: themeColor,
                      fontSize: 16,
                      flex: 1,
                      textAlign: "right",
                    }}
                  ></TextInput>
                </View>
              </>
            )}
            <Separator style={{ marginVertical: 8 }} />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                margin: 4,
              }}
            >
              <Text>webView</Text>
              <TextInput
                value={btStore.defaultUrl}
                onChangeText={btStore.setBrowserUrl}
                keyboardType="name-phone-pad"
                style={{
                  color: themeColor,
                  fontSize: 16,
                  flex: 1,
                  textAlign: "right",
                }}
              ></TextInput>
            </View>
            <Separator style={{ marginVertical: 8 }} />
            <View style={{ flexDirection: "row" }}>
              {btloginfo.loggedIn && !loading && (
                <Button
                  onPress={() => {
                    SecureStore.setItemAsync("bt_username", "");
                    SecureStore.setItemAsync("bt_password", "");
                    SecureStore.setItemAsync("bt_url", "");
                    btloginfo.setLoggedIn(false);
                  }}
                  variant="destructive"
                  style={{ flex: 1 }}
                >
                  登出
                </Button>
              )}
              {loading && (
                <Button
                  onPress={() => {
                    controller.abort();
                  }}
                  variant="outline"
                  style={{ flex: 1 }}
                >
                  取消
                </Button>
              )}
              {!btloginfo.loggedIn && (
                <Button
                  loading={loading}
                  onPress={async () => {
                    const localController = createRequestController();
                    setController(localController);
                    const result = await btLogin(
                      logUrl,
                      username,
                      password,
                      localController
                    );
                    result && btloginfo.setLoggedIn(true);
                  }}
                  style={{ flex: 1 }}
                >
                  登录
                </Button>
              )}
            </View>
          </Card>
          {/* 键盘规避with animate */}
          <AvoidKeyboard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
