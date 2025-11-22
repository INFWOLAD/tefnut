import { Text } from "@/components/ui/text";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { View } from "@/components/ui/view";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Lock, User, Link, CloudDownload } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";

export default function BtLoginScreen() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  // 登录信息三要素
  const [logUrl, setLogUrl] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    // 尝试从安全存储中获取已保存的凭据并自动登录
    (async () => {
      const un = await SecureStore.getItemAsync("bt_username");
      const pw = await SecureStore.getItemAsync("bt_password");
      const url = await SecureStore.getItemAsync("bt_url");
      console.log("Retrieved credentials:", { un, pw, url });
      if (un && pw && url) {
        // 设置信息后自动登录
        handleLogin(url, un, pw, true);
      } else {
        // 没有保存的凭据, 停止加载状态, 加载用户登录页, 取消静默模式
        setLoading(false);
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
      const response = await axios.post(
        `${Url}/api/v2/auth/login`,
        `username=${Username}&password=${Password}`,
        {
          headers: {
            Referer: "http://localhost:8080/",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          withCredentials: true,
        }
      );
      console.log("Login response:", response);
      // api除非封禁否则默认200，因此需要检查返回内容
      if (response.data.includes("Fails.")) {
        console.log("登录失败");
        toast({
          title: "登录失败",
          description: "请重新输入登录信息",
          variant: "error",
        });
      } else if (response.status === 200) {
        !silence &&
          toast({
            title: "登录成功",
            description: "正在跳转结果页...",
            variant: "success",
          });
        SecureStore.setItemAsync("bt_username", Username);
        SecureStore.setItemAsync("bt_password", Password);
        SecureStore.setItemAsync("bt_url", Url);
        // 跳转管理页，销毁登录页
        // router.dismiss();
        router.replace("/bt/manage");
      }
    } catch (error) {
      toast({
        title: "登录失败",
        description: `${error}`,
        variant: "error",
      });
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
      {/* 键盘避免视图 */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* 加载页面 */}
        {loading && (
          <View style={styles.centerCommon}>
            <Spinner variant="bars" />
          </View>
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
          </View>
        )}
      </KeyboardAvoidingView>
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
