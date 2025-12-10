export const bankInfo: Record<string, { name: string; photo: string }> = {
  "Z-BANK": {
    name: "众邦银行",
    photo:
      "https://ts2.tc.mm.bing.net/th/id/ODF.RvNQknf2M9JteBD7ZizN4g?w=32&h=32&qlt=90&pcl=fffffa&o=6&pid=1.2",
  },
  "F-BANK": {
    name: "富民银行",
    photo:
      "https://ts1.tc.mm.bing.net/th/id/ODF.-cACEgis8mIWd4LRhBojRg?w=32&h=32&qlt=90&pcl=fffffc&o=6&pid=1.2",
  },
};

export function bankCodeTrans(shortCode: string): string {
  return bankInfo[shortCode]?.name || "未知银行";
}

export function bankPhotoTrans(shortCode: string): string {
  return bankInfo[shortCode]?.photo || "";
}
