# 玄成科技接单系统客户端

玄成科技接单系统客户端面向客户，支持账号登录后管理自己的项目、提交新需求，并与老板/员工在项目内直接沟通（文字、图片、视频、语音）。客户消息会同步推送给老板和员工，双方在管理后台同一条时间线上都能看到并回复。

## 核心功能

- **登录与项目管理**：客户账号密码登录，`我的项目` 列表按登录账号隔离，只看自己的订单。
- **项目详情 + 沟通**：查看项目状态/报价/截止/需求材料；项目内聊天区与团队双向沟通，12s 轮询接收团队回复。
- **富媒体消息**：支持发送图片、视频、以及浏览器内录制的语音（H5 MediaRecorder）。
- **提交新需求**：公开表单提交，自动进入接单系统并归属到当前登录账号。

## 技术栈

- Vue 3
- Vite 5
- Element Plus
- 文件粘贴 / 上传组件、MediaRecorder 录音
- Fetch API
- Sass

## 关联仓库

| 子项目 | GitHub 仓库 | 说明 |
| --- | --- | --- |
| 后端服务 | [xuancheng-order-backend](https://github.com/jiangyi3265/xuancheng-order-backend) | 提供订单、提醒、时间线、系统配置等业务 API |
| 管理后台 | [xuancheng-order-admin](https://github.com/jiangyi3265/xuancheng-order-admin) | 面向老板和员工的接单管理后台 |
| 用户端 | [xuancheng-order-app](https://github.com/jiangyi3265/xuancheng-order-app) | 面向客户的公开需求提交入口 |

## 快速启动

```bash
# 后端默认运行在 http://localhost:8080
npm install
npm run dev
```

默认访问地址为 `http://localhost:5174`。开发环境通过 `vite.config.js` 将 `/jiedan`、`/login`、`/captchaImage` 代理到后端服务。

演示账号（密码均为 `customer123`）：`laowang` / `hailan` / `customer`。

> 语音录制依赖浏览器 MediaRecorder，需在 `localhost` 或 HTTPS 环境下使用；首次录音会请求麦克风权限。

## 客户端接口

| 接口 | 说明 |
| --- | --- |
| `GET /jiedan/portal/orders` | 我的项目列表（按登录账号隔离） |
| `GET /jiedan/portal/orders/{id}` | 项目详情 + 沟通时间线 |
| `POST /jiedan/portal/message` | 发送留言（文字/图片/视频/语音），老板+员工同时未读并推送 |
| `POST /jiedan/order/intake` | 提交新需求，归属当前登录账号 |

## 简历描述示例

构建客户自助端：账号隔离的项目管理 + 项目内富媒体沟通（图片/视频/浏览器录音语音），客户消息实时同步给老板与员工，复用订单时间线作为双向聊天频道。
