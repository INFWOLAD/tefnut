import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { useStore as useBtStore } from "@/stores/bt/btInfo";
import { useBtLogin } from "@/hooks/useBtLogin";
import { Button } from "@/components/ui/button";
import { KeyRound, Link, Server, User } from "lucide-react-native";

interface BtLoginSheetProps {
  sheetRef: any;
}

export function BtLoginSheet({ sheetRef }: BtLoginSheetProps) {
  // bt 登录添加用户信息
  const [btAddUrl, setBtAddUrl] = useState("");
  const [btAddUsername, setBtAddUsername] = useState("");
  const [btAddPassword, setBtAddPassword] = useState("");
  const [btAddNickname, setBtAddNickname] = useState("");
  // bt 登录hook
  const { btLogin } = useBtLogin();
  const btStore = useBtStore();
  // 按钮loading状态
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 每次打开登录弹窗时，清空输入框
    setBtAddUrl("");
    setBtAddUsername("");
    setBtAddPassword("");
    setBtAddNickname("");
  }, []);

  return (
    <View style={{ gap: 20 }}>
      <View>
        <Input
          label="服务器名称"
          icon={Server}
          value={btAddNickname}
          onChangeText={setBtAddNickname}
          variant="outline"
          placeholder="搜索用唯一标识"
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize="none"
          textContentType="username"
        />
      </View>
      <View>
        <Input
          label="Url"
          icon={Link}
          value={btAddUrl}
          onChangeText={setBtAddUrl}
          variant="outline"
          placeholder="http://xxx:xxx"
          keyboardType="url"
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize="none"
          textContentType="URL"
        />
      </View>
      <View>
        <Input
          label="登录名"
          icon={User}
          value={btAddUsername}
          onChangeText={setBtAddUsername}
          variant="outline"
          placeholder="bt登录名"
          keyboardType="email-address"
          spellCheck={false}
          autoCorrect={false}
          autoCapitalize="none"
          textContentType="username"
        />
      </View>
      <View>
        <Input
          label="登录密码"
          icon={KeyRound}
          value={btAddPassword}
          onChangeText={setBtAddPassword}
          variant="outline"
          placeholder="bt登录密码"
          keyboardType="default"
          secureTextEntry={true}
          textContentType="password"
        />
      </View>
      <View
        style={{
          flex: 1,
          width: "100%",
          flexDirection: "row",
          gap: 12,
          marginTop: 12,
        }}
      >
        <Button
          onPress={async () => {
            if (btAddNickname && btAddPassword && btAddUrl && btAddUsername) {
              setLoading(true);
              const result = await btLogin(
                btAddUrl,
                btAddUsername,
                btAddPassword
              );
              if (result) {
                // 保存用户信息到本地存储
                const newUser = {
                  uuid: Date.now().toString(),
                  nickname: btAddNickname,
                  url: btAddUrl,
                  username: btAddUsername,
                  password: btAddPassword,
                };
                const updatedUserList = [...btStore.userList, newUser];
                btStore.setUserList(updatedUserList);
                console.log("New user added:", newUser);
                await SecureStore.setItemAsync(
                  "bt_userList",
                  JSON.stringify(updatedUserList)
                );
                await SecureStore.setItemAsync("bt_selectedUuid", newUser.uuid);
                btStore.setSelectedUuid(newUser.uuid);
                btStore.setLoggedIn(true);
                sheetRef && sheetRef.close();
              }
              setLoading(false);
            }
          }}
          loading={loading}
          style={{ flex: 1 }}
          // disabled={
          //   !btAddNickname || !btAddPassword || !btAddUrl || !btAddUsername
          // }
        >
          登录并添加
        </Button>
      </View>
    </View>
  );
}
