import { Text } from "@/components/ui/text";
import { View } from "@/components/ui/view";
import { Button } from "@/components/ui/button";
import { request } from "@/utils/request";
import { useStore as useBtStore } from "@/stores/bt/btInfo";
import { ScrollView } from "@/components/ui/scroll-view";

interface BtTorrentInfoProps {
  torrent: any;
  sheetRef: any;
}

export function BtTorrentInfo({ torrent, sheetRef }: BtTorrentInfoProps) {
  const btStore = useBtStore();
  const infoList: { [key: string]: string } = {
    任务名: torrent.name,
    总文件: `${(torrent.size / 1024 / 1024 / 1024).toFixed(2)} GB`,
    已下载: `${(torrent.completed / 1024 / 1024).toFixed(2)} MB`,
    已上传: `${(torrent.uploaded / 1024 / 1024).toFixed(2)} MB`,
    哈希: torrent.hash,
    分享率: torrent.ratio.toFixed(4),
    添加时间: new Date(torrent.added_on * 1000).toLocaleString(),
  };

  // 操作按钮统一方法
  function getManageButton(
    hash: string,
    url: string,
    content: string,
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
        onPress={async () => {
          try {
            const response = await request({
              url: url,
              data: `hashes=${hash}${moreExt || ""}`,
              method: "POST",
            });
            sheetRef.close();
          } catch (err) {
          } finally {
          }
        }}
        variant={type}
      >
        {content}
      </Button>
    );
  }

  return (
    <ScrollView
      style={{
        flex: 1,
        padding: 12,
      }}
    >
      {Object.entries(infoList).map(([key, value], index) => (
        <View style={{ marginBottom: 12 }} key={index}>
          <Text variant="body" style={{ fontWeight: "600" }}>
            {key}
          </Text>
          <Text variant="caption" style={{ marginTop: 2 }}>
            {value}
          </Text>
        </View>
      ))}
      <View style={{ gap: 12 }}>
        {torrent.state === "downloading" &&
          getManageButton(
            torrent.hash,
            `${btStore.selectedUser?.url}/api/v2/torrents/pause`,
            "暂停",
            "outline"
          )}
        {torrent.state === "pausedDL" &&
          getManageButton(
            torrent.hash,
            `${btStore.selectedUser?.url}/api/v2/torrents/resume`,
            "恢复",
            "default"
          )}
        {getManageButton(
          torrent.hash,
          `${btStore.selectedUser?.url}/api/v2/torrents/delete`,
          "删除",
          "destructive",
          "&deleteFiles=true"
        )}
      </View>
    </ScrollView>
  );
}
