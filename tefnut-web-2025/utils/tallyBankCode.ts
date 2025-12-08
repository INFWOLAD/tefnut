export const bankCode: Record<string, string> = {
  "Z-BANK": "众邦银行",
  "F-BANK": "富民银行",
};

export function bankCodeTrans(shortCode: string): string {
  return bankCode[shortCode] || "未知银行";
}
