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

旧演示 SQL 中的账号不用于正式部署。

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

## 当前部署（2026-10-29）

- 管理后台：https://jiedanxt.oksja.cn/
- 客户端：https://jiedanxt.oksja.cn/client/
- 后端由同域名 `/jiedan/**`、`/login`、`/captchaImage` 代理，服务监听 `127.0.0.1:18091`。
- AI 改码流水线已移除；订单、客户账号、双向沟通、Bug 跟进和附件功能保留。
- GitHub Actions 负责构建并保存产物，已移除指向旧域名的自动部署。发布操作见后端 `deploy/production.md`。
- 正式管理员密码单独交付；客户账号由管理员在「客户账号」中创建。线上没有预置演示客户和演示订单。

部署到当前域名时，使用 `VITE_BASE=/client/ npm run build` 构建。
