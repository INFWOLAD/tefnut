# Tefnut

## 功能说明

### 磁力管理

1. 多服务器登录/快速切换
2. 种子管理/信息查看/分类排序
3. 剪贴板磁力一键添加
4. 内嵌 webview 自动捕获提交(或复制)磁力下载
5. ...仍在增加

### 存单管理

1. 添加多个银行定期存单
2. 根据不同维度排序
3. 快速复制/修改存单
4. 根据录入存单数据计算利息
5. 汇总图标查看占比

### 仍在增加

## 主要框架/组件

1. nodejs
2. react native + expo
3. zustand 状态管理
4. bna-ui 组件库
5. lucide-react-native 图标库

## 运行/构建

1. 以工作区形式打开
2. 已配置 nodejs v23 以上

```bash
# windows建议先关闭git自动转换LF换行符
git config --global core.autocrlf false

# 安装包
npm install

# expo go打开
npm run start

# 本地构建启动（请预先配置android sudio/xcode)
# android
npx expo run:android
# ios
npx expo run:ios

```
