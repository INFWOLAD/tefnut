import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { View } from "@/components/ui/view";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { AvoidKeyboard } from "@/components/ui/avoid-keyboard";
import { Lock, User, Link, CloudDownload, X } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { SafeAreaView } from "react-native-safe-area-context";
import { request, createRequestController } from "@/utils/request";
import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { StyleSheet } from "react-native";
import { router } from "expo-router";

export default function BtLoginScreen() {
  const { toast } = useToast();
  // 用于中断请求
  const controller = createRequestController();
  // 加载中
  const [loading, setLoading] = useState(false);
  // 登录信息三要素
  const [logUrl, setLogUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

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
        setPassword(pw);
      }
    })();
  }, []);

  // 登录提交方法
  async function handleLogin(
    Url: string,
    Username: string,
    Password: string,
    silence = false // 是否静默登录
  ) {
    console.log("Logging in with:", { Username, Password, Url });
    setLoading(true);
    // 此处调用qb web api
    try {
      const response = await request({
        url: `${Url}/api/v2/auth/login`,
        data: `username=${Username}&password=${Password}`,
        headers: {
          Referer: "http://localhost:8080/",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "POST",
        toast,
        specialErr: { keywords: "Fails.", msg: "请重新输入登录信息" },
        controller,
      });
      !silence &&
        toast({
          title: "登录成功",
          description: "",
          variant: "success",
        });
      SecureStore.setItemAsync("bt_username", Username);
      SecureStore.setItemAsync("bt_password", Password);
      SecureStore.setItemAsync("bt_url", Url);
      // 跳转管理页，销毁登录页
      // router.dismiss();
      router.replace("/bt/manage");
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        gap: 16,
      }}
    >
      {/* 加载页面 */}
      {loading && (
        <>
          <View style={styles.centerCommon}>
            <Spinner variant="bars" size="lg" />
          </View>
          <Button
            size="icon"
            variant="outline"
            icon={X}
            onPress={() => {
              console.log("中断");
              controller.abort();
            }}
            style={{ alignSelf: "center", bottom: 20 }}
          />
        </>
      )}
      {/* 登录信息填写页 */}
      {!loading && (
        <View style={[styles.centerCommon, { paddingBottom: 20 }]}>
          {/* 表单上方logo */}
          <Icon
            name={CloudDownload}
            size={48}
            style={{ alignSelf: "center", marginBottom: 30 }}
          />
          <Input
            label="QB地址"
            placeholder="http://xxx:xxx"
            icon={Link}
            value={logUrl}
            onChangeText={setLogUrl}
            keyboardType="web-search"
          />
          <Input
            label="用户名"
            placeholder="qbittorrent用户名"
            icon={User}
            value={username}
            onChangeText={setUsername}
          />
          <Input
            label="密码"
            placeholder="请输入"
            icon={Lock}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {/* 用箭头函数调函数防止立刻执行 */}
          <Button onPress={() => handleLogin(logUrl, username, password)}>
            登录
          </Button>
          {/* 键盘规避with animate */}
          <AvoidKeyboard />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centerCommon: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
});
