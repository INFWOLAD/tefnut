export function formatAmount(amount: string) {
  // 格式化金额，千分位逗号显示，保留两位小数
  const num = Number(amount);
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
