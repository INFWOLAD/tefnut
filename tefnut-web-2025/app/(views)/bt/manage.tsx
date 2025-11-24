import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent } from "@/components/ui/card";
import { useBottomSheet, BottomSheet } from "@/components/ui/bottom-sheet";
import { Plus, Zap, RefreshCcw } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useEffect, useState, useRef } from "react";
import { Pressable } from "react-native";
import { useStore } from "@/stores/bt/bt";
import { request } from "@/utils/request";

const stateMap: { [key: string]: string } = {
  error: "错误",
  pausedUP: "上传已暂停",
  pausedDL: "下载已暂停",
  queuedUP: "排队上传",
  queuedDL: "排队下载",
  checkingUP: "检查上传",
  checkingDL: "检查下载",
  downloading: "下载中",
  stalledDL: "下载停滞",
  checkingResumeData: "检查恢复数据",
  moving: "移动中",
  uploading: "上传中",
  stalledUP: "上传停滞",
  unknown: "未知状态",
};

export default function BtManageScreen() {
  const { toast } = useToast();
  const navigation = useNavigation();
  const magnetBottomSheet = useBottomSheet();

  // 磁力链接输入内容
  const [magnet, setMagnet] = useState("");
  // 任务列表
  const [torrents, setTorrents] = useState<Array<any>>([]);
  // 刷新用rid
  const [rid, setRid] = useState<number>(0);
  // 种子列表加载状态
  const [loading, setLoading] = useState(true);
  // 种子添加加载状态
  const [adding, setAdding] = useState(false);

  // zustand
  const btStore = useStore();

  // 计时器id，防止重复生成
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    console.log("Current URL from store:", btStore.url);
    navigation.setOptions({
      title: "",
      headerRight: () => (
        <>
          {/* 手动刷新 */}
          <Pressable
            onPress={() => {
              fetchTorrents();
            }}
            style={{
              padding: 6,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 20,
            }}
          >
            <Icon name={RefreshCcw} size={24} />
          </Pressable>
          {/* 直接读取剪贴板添加 */}
          <Pressable
            onPress={() => {
              console.log("Add torrent via clipboard");
              handleClipboardAdd();
            }}
            style={{
              padding: 6,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 20,
            }}
          >
            {adding && <Spinner />}
            {!adding && <Icon name={Zap} size={24} />}
          </Pressable>
          {/* 手动添加 */}
          <Pressable
            onPress={() => {
              console.log("Add torrent button pressed");
              magnetBottomSheet.open();
            }}
            style={{
              padding: 6,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Icon name={Plus} size={24} />
          </Pressable>
        </>
      ),
    });
  }, []);

  // 拉起页面加载计时器，页面销毁清除计时器
  useEffect(() => {
    startInterval();
    // 卸载组件时执行清理
    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  // 快速剪贴板添加
  async function handleClipboardAdd() {
    setAdding(true);
    const clipboardContent = await Clipboard.getStringAsync();
    console.log("Clipboard content:", clipboardContent);
    handleSubmit(clipboardContent);
    setAdding(false);
  }

  // 定时刷新计时器
  async function startInterval() {
    if (!intervalRef.current) {
      // 首次请求拉去任务列表
      intervalRef.current = setInterval(async () => {
        const result = await fetchTorrents(true);
        if (!result && intervalRef.current !== null) {
          // 错误后清理计时器
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }, 5000); // 每15秒拉取一次
    }
  }

  // 拉取任务列表
  async function fetchTorrents(silence = false) {
    !silence && setLoading(true);
    try {
      const response = await request({
        url: `${btStore.url}/api/v2/sync/maindata?rid=${rid}`,
        method: "POST",
        toast,
      });
      //TODO: 用于调试非全量情况
      !response.full_update &&
        console.log("Partial update received:", response);
      // 返回为list
      // console.log("Fetched torrents:", response);
      setTorrents(response.torrents ? Object.values(response.torrents) : []);
      setRid(response.rid);
    } catch (error) {
      console.log("Error fetching torrents:", error);
      return false;
    } finally {
      setLoading(false);
    }
    // 由于网络问题导致请求失败，手动刷新时重新拉起计时器
    startInterval();
    return true;
  }

  // 添加磁力
  async function handleSubmit(Magnet: string = magnet) {
    // 处理提交逻辑
    const formData = new FormData();
    formData.append("urls", Magnet);
    magnetBottomSheet.close();
    // 从zustand中取login的url
    const response = await request({
      url: `${btStore.url}/api/v2/torrents/add`,
      method: "POST",
      data: formData,
      toast,
    });
    console.log("Add torrent response:", response);
    // 清空输入框
    setMagnet("");
    if (response && response.includes("Ok.")) {
      toast({
        title: "成功",
        description: "已添加下载任务",
        variant: "success",
      });
    } else {
      toast({
        title: "失败",
        description: "添加任务失败，请检查链接或稍后重试",
        variant: "error",
      });
    }
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {loading && (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            gap: 16,
            paddingHorizontal: 24,
          }}
        >
          <Spinner variant="dots" />
        </View>
      )}
      {!loading && (
        <ScrollView
          style={{
            flex: 1,
            padding: 24,
            paddingTop: 100,
          }}
        >
          <View style={{ gap: 16 }}>
            {torrents.length === 0 && <Text>无任务</Text>}
            {torrents.map((torrent, index) => (
              <Card key={index}>
                <CardContent>
                  <Text style={{ marginBottom: 8, fontWeight: "600" }}>
                    {torrent.name}
                  </Text>
                  <Text>状态: {stateMap[torrent.state] || torrent.state}</Text>
                  <Text>进度: {(torrent.progress * 100).toFixed(2)}%</Text>
                  <Text>
                    下载速度: {(torrent.dlspeed / 1024 / 1024).toFixed(2)} MB/s
                  </Text>
                  <Text>
                    上传速度: {(torrent.upspeed / 1024 / 1024).toFixed(2)} MB/s
                  </Text>
                </CardContent>
              </Card>
            ))}
          </View>
          <BottomSheet
            isVisible={magnetBottomSheet.isVisible}
            onClose={() => {
              magnetBottomSheet.close();
              setMagnet("");
            }}
            title="新增磁力下载"
            snapPoints={[0.6, 0.8]}
            enableBackdropDismiss={true}
          >
            <View style={{ gap: 20 }}>
              <View style={{ gap: 12 }}>
                <Input
                  value={magnet}
                  onChangeText={setMagnet}
                  variant="outline"
                  placeholder="Enter your magnet link"
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
                  variant="outline"
                  onPress={() => {
                    magnetBottomSheet.close();
                    setMagnet("");
                  }}
                  style={{ flex: 1 }}
                >
                  取消
                </Button>
                <Button onPress={handleSubmit} style={{ flex: 1 }}>
                  添加
                </Button>
              </View>
            </View>
          </BottomSheet>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
