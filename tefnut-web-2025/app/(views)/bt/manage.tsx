import { ScrollView } from "@/components/ui/scroll-view";
import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/components/ui/link";
import { useBottomSheet, BottomSheet } from "@/components/ui/bottom-sheet";
import {
  Plus,
  ClipboardPaste,
  Pause,
  Trash2,
  Play,
  Compass,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useNavigation } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { useEffect, useState, useRef } from "react";
import { Pressable, Platform } from "react-native";
import { request } from "@/utils/request";
import * as SecureStore from "expo-secure-store";
import { useStore as useBtStore } from "@/stores/bt/btInfo";
import { showSuccessAlert } from "@/components/ui/alert";
import { useColor } from "@/hooks/useColor";
import { Badge } from "@/components/ui/badge";

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
  const btStore = useBtStore();
  const navigation = useNavigation();
  const magnetBottomSheet = useBottomSheet();
  // 磁力链接输入内容
  const [magnet, setMagnet] = useState("");
  // 种子列表加载状态
  const [listLoading, setListLoading] = useState(true);
  // 种子添加加载状态
  const [adding, setAdding] = useState(false);
  // 种子管理加载状态
  const [manageLoading, setManageLoading] = useState<{
    [key: string]: boolean;
  }>({});
  const themeColor = useColor("text");

  // 计时器id，防止重复生成
  const intervalRef = useRef<number | null>(null);
  const btUrl = useRef<string | null>("");

  useEffect(() => {
    (async () => {
      btUrl.current = btStore.selectedUser?.url || null;
      // 立刻执行一次，随后计时器启动
      await fetchTorrents(true);
      navigation.setOptions({
        title: "",
        headerRight: () => {
          return (
            <>
              {/* 浏览器页 */}
              {Platform.OS === "android" ? (
                <Pressable
                  onPress={() => {
                    router.push("/bt/btSheet");
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityRole="button"
                  android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                  style={{
                    padding: 6,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 20,
                  }}
                >
                  <Icon name={Compass} size={24} />
                </Pressable>
              ) : (
                <Link
                  href="/bt/btSheet"
                  style={{
                    padding: 6,
                    justifyContent: "center",
                    alignItems: "center",
                    marginRight: 20,
                    marginLeft: 8,
                  }}
                  asChild
                >
                  <Icon name={Compass} size={24} />
                </Link>
              )}

              {/* 直接读取剪贴板添加 */}
              <Pressable
                onPress={() => {
                  handleClipboardAdd();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                style={{
                  padding: 6,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 20,
                }}
              >
                {adding && <Spinner />}
                {!adding && <Icon name={ClipboardPaste} size={24} />}
              </Pressable>
              {/* 手动添加 */}
              <Pressable
                onPress={() => {
                  magnetBottomSheet.open();
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                android_ripple={{ color: "rgba(0,0,0,0.08)" }}
                style={{
                  padding: 6,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Icon name={Plus} size={24} />
              </Pressable>
            </>
          );
        },
      });
      // 拉起页面加载计时器，页面销毁清除计时器
      startInterval();
      // 卸载组件时执行清理
      return () => {
        if (intervalRef.current !== null) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    })();
  }, []);

  // 全局磁力，变化即添加,静默
  useEffect(() => {
    console.log(`调用下载${btStore.browserUrl}`);
    btStore.browserUrl && handleSubmit(btStore.browserUrl, true);
    return () => {
      console.log("清空浏览器捕获的磁力");
      btStore.setBrowserUrl("");
    };
  }, [btStore.browserUrl]);

  // 快速剪贴板添加
  async function handleClipboardAdd() {
    setAdding(true);
    const clipboardContent = await Clipboard.getStringAsync();
    console.log("Clipboard content:", clipboardContent);
    if (!clipboardContent.startsWith("magnet:")) {
      showSuccessAlert("提示", "剪贴板中非磁力连接", () => setAdding(false));
      return;
    }
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
      }, 2000); // 每2秒拉取一次
    }
  }

  // 拉取任务列表
  async function fetchTorrents(silence = false) {
    !silence && setListLoading(true);
    try {
      const response = await request({
        // url: `${btUrl.current}/api/v2/sync/maindata?rid=${rid}`,
        url: `${btUrl.current}/api/v2/torrents/info`,
        method: "POST",
        toast,
        withOutLog: true,
      });
      btStore.setTorrentsList(response);
    } catch (error) {
      console.log("Error fetching torrents:", error);
      return false;
    } finally {
      setListLoading(false);
    }
    // 由于网络问题导致请求失败，手动刷新时重新拉起计时器
    startInterval();
    return true;
  }

  // 添加磁力
  async function handleSubmit(
    Magnet: string = magnet,
    slience: boolean = false
  ) {
    // 处理提交逻辑
    const formData = new FormData();
    formData.append("urls", Magnet);
    magnetBottomSheet.close();
    console.log("Submitting magnet link:", Magnet, formData, btUrl.current);
    // 从zustand中取login的url
    const response = await request({
      url: `${btUrl.current}/api/v2/torrents/add`,
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data;",
      },
      data: formData,
      toast,
    });
    console.log("Add torrent response:", response);
    // 清空输入框
    setMagnet("");
    // 静默则直接返回
    if (slience) return;
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

  // 操作按钮统一方法
  function getManageButton(
    iconName: React.ComponentType,
    hash: string,
    url: string,
    type:
      | "link"
      | "success"
      | "default"
      | "destructive"
      | "outline"
      | "secondary"
      | "ghost",
    moreExt?: string
  ) {
    return (
      <Button
        icon={iconName}
        size="icon"
        loading={!!manageLoading[hash]}
        onPress={async () => {
          setManageLoading((prev) => ({
            ...prev,
            [hash]: true,
          }));
          try {
            const response = await request({
              url: url,
              data: `hashes=${hash}${moreExt || ""}`,
              method: "POST",
              toast,
            });
          } catch (err) {
          } finally {
            setManageLoading((prev) => ({
              ...prev,
              [hash]: false,
            }));
          }
        }}
        variant={type}
      />
    );
  }

  return (
    <>
      <SafeAreaView edges={["top", "left", "right"]} style={{ flex: 1 }}>
        {listLoading && (
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
        {!listLoading && (
          <>
            <View
              style={{
                justifyContent: "space-between",
                flexDirection: "row",
                paddingTop: Platform.OS === "android" ? 0 : 70,
                paddingHorizontal: 14,
              }}
            >
              <Text style={{ fontSize: 14, color: themeColor, opacity: 0.8 }}>
                任务数:{btStore.torrentsList.length}
              </Text>
              <Text style={{ fontSize: 14, color: themeColor, opacity: 0.8 }}>
                用户:{btStore.selectedUser?.nickname || "未知"}
              </Text>
              <Text style={{ fontSize: 14, color: themeColor, opacity: 0.8 }}>
                DL:
                {(btStore.totalDownloadSpeed / 1024 / 1024).toFixed(2)} MB/s
              </Text>
              <Text style={{ fontSize: 14, color: themeColor, opacity: 0.8 }}>
                UL:
                {(btStore.totalUploadSpeed / 1024 / 1024).toFixed(2)} MB/s
              </Text>
            </View>

            <ScrollView
              style={{
                flex: 1,
                padding: 12,
              }}
            >
              <View style={{ gap: 16 }}>
                {btStore.torrentsList.length === 0 && <Text>无任务</Text>}
                {btStore.torrentsList.map((torrent, index) => (
                  <Card key={index}>
                    <CardContent>
                      <Text style={{ marginBottom: 8, fontWeight: "600" }}>
                        {torrent.name}
                      </Text>
                      <Text
                        variant="caption"
                        style={{
                          color: "#666",
                          fontSize: 12,
                          textAlign: "right",
                        }}
                      >
                        {(torrent.progress * 100).toFixed(2)}%
                      </Text>
                      <Progress value={torrent.progress * 100} height={5} />
                      <View style={{ flexDirection: "row", marginTop: 8 }}>
                        <View style={{ flex: 1 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Text>
                              状态: {stateMap[torrent.state] || torrent.state}
                            </Text>
                            <Badge
                              variant={
                                torrent.state === "downloading"
                                  ? "success"
                                  : torrent.state === "pausedDL"
                                    ? "default"
                                    : "outline"
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

                          <Text>
                            下载速度:{" "}
                            {(torrent.dlspeed / 1024 / 1024).toFixed(2)} MB/s
                          </Text>
                          <Text>
                            上传速度:{" "}
                            {(torrent.upspeed / 1024 / 1024).toFixed(2)} MB/s
                          </Text>
                        </View>
                        <View
                          style={{
                            flexDirection: "row",
                            alignSelf: "center",
                            gap: 8,
                          }}
                        >
                          {torrent.state === "downloading" &&
                            getManageButton(
                              Pause,
                              torrent.hash,
                              `${btUrl.current}/api/v2/torrents/pause`,
                              "outline"
                            )}
                          {torrent.state === "pausedDL" &&
                            getManageButton(
                              Play,
                              torrent.hash,
                              `${btUrl.current}/api/v2/torrents/resume`,
                              "default"
                            )}
                          {getManageButton(
                            Trash2,
                            torrent.hash,
                            `${btUrl.current}/api/v2/torrents/delete`,
                            "destructive",
                            "&deleteFiles=true"
                          )}
                        </View>
                      </View>
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
                snapPoints={[0.3, 0.5]}
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
          </>
        )}
      </SafeAreaView>
    </>
  );
}
