import { ScrollView } from "./ui/scroll-view";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore as useBtStore } from "@/stores/bt/btInfo";
import { WebView } from "react-native-webview";
import type { WebView as WebViewType } from "react-native-webview";
import { Link, ArrowLeft } from "lucide-react-native";
import { useRef, useState } from "react";
import { View } from "./ui/view";
import { showSuccessAlert } from "@/components/ui/alert";

import { SafeAreaView } from "react-native-safe-area-context";
import { Platform } from "react-native";

interface BrowserSheetProps {
  catchMagnet: boolean; // 抓取磁力推送到btStore
  defaultUrl: string; // 浏览器默认打开地址
}

export function BrowserSheet({
  catchMagnet = false,
  defaultUrl = "https://www.bing.com",
}) {
  const webviewRef = useRef<WebViewType>(null);
  const btStore = useBtStore();
  const [canGoBack, setCanGoBack] = useState(false);
  const [url, setUrl] = useState(defaultUrl);
  const [browserUrl, setBrowserUrl] = useState(defaultUrl);

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
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 10, flexDirection: "row", alignItems: "center" }}>
        {Platform.OS === "ios" ? null : (
          <Button
            size="icon"
            variant="outline"
            icon={ArrowLeft}
            disabled={!canGoBack}
            onPress={() => {
              webviewRef.current?.goBack();
            }}
          />
        )}
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Input
            placeholder="url"
            icon={Link}
            value={url}
            onChangeText={setUrl}
            onBlur={handleUrl}
            variant="outline"
          />
        </View>
      </View>
      <WebView
        ref={webviewRef}
        style={{ height: 900 }}
        source={{ uri: browserUrl }}
        onNavigationStateChange={(navState) => {
          setCanGoBack(navState.canGoBack);
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
    </SafeAreaView>
  );
}
