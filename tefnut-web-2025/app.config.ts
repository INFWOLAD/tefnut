import { config } from "dotenv";
import path from "path";
import type { ConfigContext } from "@expo/config";

// 读取当前 NODE_ENV 或者自定义 APP_ENV
const ENV = process.env.APP_ENV || "production";

// 根据环境加载对应的 env 文件
config({
  path: path.resolve(process.cwd(), `.env.${ENV}`),
});

export default ({ config: appConfig }: ConfigContext) => ({
  ...appConfig,
  extra: {
    APP_ENV: ENV,
    // API_URL: process.env.API_URL,
  },
});
