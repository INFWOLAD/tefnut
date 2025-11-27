import { ScrollView } from "./ui/scroll-view";
import { Text } from "./ui/text";
import { Input } from "@/components/ui/input";
import { useStore as useBtStore } from "@/stores/bt/btInfo";
import { WebView } from "react-native-webview";
import { Link } from "lucide-react-native";
import { useState } from "react";
import { View } from "./ui/view";
import { showSuccessAlert } from "@/components/ui/alert";

export default function browserSheet(catchMagnet = false) {
  const btStore = useBtStore();

  const [url, setUrl] = useState("https://www.bing.com");
  const [browserUrl, setBrowserUrl] = useState("https://www.bing.com");

  // input框回车后，浏览器url被更新，将浏览器url和输入框url解耦
  function handleUrl() {
    setBrowserUrl(url);
  }

  // 将url存入zustand
  function handleMagnet(url: string) {
    btStore.setBrowserUrl(url);
    showSuccessAlert("成功", "已添加到下载任务", () =>
      console.log("Success acknowledged")
    );
  }

  return (
    <ScrollView
      style={{ flex: 1 }}
      overScrollMode="never"
      contentContainerStyle={{ flex: 1, paddingTop: 10 }}
    >
      <View style={{ padding: 10 }}>
        <Input
          placeholder="url"
          icon={Link}
          value={url}
          onChangeText={setUrl}
          onBlur={handleUrl}
          variant="outline"
        />
      </View>
      <WebView
        style={{ height: 900 }}
        source={{ uri: browserUrl }}
        onNavigationStateChange={(navState) => {
          setBrowserUrl(navState.url); // 同步回浏览器实际访问地址
          setUrl(navState.url); // 同步回input展示地址
        }}
        // 仅在磁力模式下推送磁力任务
        onMessage={(event) => {
          const href = event.nativeEvent.data;
          console.log("捕获到磁力链接：", href);
          catchMagnet && handleMagnet(href);
        }}
        // 只有ios支持左右滑动手势
        allowsBackForwardNavigationGestures={true}
        injectedJavaScript={`
          document.addEventListener('click', function(e) {
            const a = e.target.closest('a');
            if (a && a.href.startsWith('magnet:')) {
              e.preventDefault(); // 阻止 WebView 自己加载
              window.ReactNativeWebView.postMessage(a.href);
            }
          });
        `}
      />
    </ScrollView>
  );
}
