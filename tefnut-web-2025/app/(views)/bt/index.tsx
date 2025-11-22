import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Button } from "@/components/ui/button";
import { Lock, User } from "lucide-react-native";
import { Input } from "@/components/ui/input";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import { useState, useEffect } from "react";
import * as SecureStore from "expo-secure-store";

export default function BtScreen() {
  const [logged, setLogged] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    async () => {
      const un = await SecureStore.getItemAsync("bt_username");
    };
  }, []);
  const passwordError =
    password && password.length < 6
      ? "Password must be at least 6 characters"
      : "";

  function handleLogin() {
    console.log("Logging in with:", { username, password });
    axios
      .post(
        "http://172.22.58.66:10002/api/v2/auth/login",
        `username=${username}&password=${password}`,
        {
          headers: {
            Referer: "http://localhost:8080/",
            "Content-Type": "application/x-www-form-urlencoded",
          },
          withCredentials: true,
        }
      )
      .then((response) => {
        console.log("Login response:", response);
        if (response.data.includes("Fails.")) {
          console.log("登录失败");
        } else if (response.status === 200) {
          console.log("登录成功");
          setLogged(true);
        }
      })
      .catch((error) => {
        console.error("Login failed:", error);
      });
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        gap: 16,
      }}
    >
      {/* <Text
        variant="heading"
        style={{
          textAlign: "center",
        }}
      >
        bt下载页面
      </Text> */}
      {!logged && (
        <View
          style={{
            flex: 1,
            gap: 16,
            paddingHorizontal: 24,
            paddingTop: 100,
          }}
        >
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
            error={passwordError}
            secureTextEntry
          />
          <Button onPress={handleLogin}>登录</Button>
        </View>
      )}
      {/* {logged && (
        
      )} */}
    </SafeAreaView>
  );
}
