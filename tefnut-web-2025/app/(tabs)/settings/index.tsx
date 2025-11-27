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
import { AvoidKeyboard } from "@/components/ui/avoid-keyboard";
import { Lock, User, Link } from "lucide-react-native";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { useStore as useBtStore } from "@/stores/bt/btInfo";
import { SafeAreaView } from "react-native-safe-area-context";
import { useBtLogin } from "@/hooks/useBtLogin";
import { createRequestController } from "@/utils/request";

export default function SettingsScreen() {
  // 登录hook
  const { btLogin, loading } = useBtLogin();
  // 登录信息三要素
  const [logUrl, setLogUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  // bt zustand
  const btloginfo = useBtStore();
  // 请求中断
  const controller = createRequestController();

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
        const result = await btLogin(url, un, pw, controller, true);
        result && btloginfo.setLoggedIn(true);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        style={{
          flex: 1,
          padding: 24,
        }}
      >
        <View style={{ gap: 4, marginTop: 8 }}>
          <Card>
            <CardHeader
              style={{
                marginHorizontal: 6,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <CardTitle>Bt下载</CardTitle>
              <CardDescription>
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
              </CardDescription>
            </CardHeader>
            <CardContent>
              <View style={{ gap: 16 }}>
                <View>
                  <Input
                    label="QB地址"
                    placeholder="http://xxx:xxx"
                    icon={Link}
                    value={logUrl}
                    onChangeText={setLogUrl}
                    keyboardType="web-search"
                    variant={btloginfo.loggedIn ? "filled" : "outline"}
                    disabled={btloginfo.loggedIn}
                  />
                </View>
                <View>
                  <Input
                    label="用户名"
                    placeholder="qbittorrent用户名"
                    icon={User}
                    value={username}
                    onChangeText={setUsername}
                    variant={btloginfo.loggedIn ? "filled" : "outline"}
                    disabled={btloginfo.loggedIn}
                  />
                </View>
                {/* 登录状态下不展示密码 */}
                {!btloginfo.loggedIn && (
                  <View>
                    <Input
                      label="密码"
                      placeholder="请输入"
                      icon={Lock}
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                      variant="outline"
                    />
                  </View>
                )}
              </View>
            </CardContent>
            <CardFooter>
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
                >
                  取消
                </Button>
              )}
              {!btloginfo.loggedIn && (
                <Button
                  loading={loading}
                  onPress={async () => {
                    const result = await btLogin(
                      logUrl,
                      username,
                      password,
                      controller
                    );
                    result && btloginfo.setLoggedIn(true);
                  }}
                >
                  登录
                </Button>
              )}
            </CardFooter>
          </Card>
          {/* 键盘规避with animate */}
          <AvoidKeyboard />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
