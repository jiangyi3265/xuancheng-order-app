# 玄成科技接单系统客户端

面向客户：账号登录后查看自己的项目、提交新需求，并在项目内与团队直接沟通（文字、图片、视频、语音）。客户的消息会提醒该项目的负责人和总管理员，双方在管理后台同一条时间线上看到并回复。

## 核心功能

- **登录与项目管理**：客户账号密码登录，「我的项目」只显示自己的订单。
- **项目详情 + 沟通**：查看状态 / 报价 / 截止 / 需求材料；项目内聊天与团队双向沟通，页面每 2 秒问一次版本号，有变化才刷新。
- **富媒体消息**：图片、视频、浏览器内录制的语音（H5 MediaRecorder）。
- **Bug 清单**：在项目里快速创建 Bug、追加说明、标记已解决。
- **提交新需求**：自动进入接单系统，并落到你的归属管理员名下。
- **撤回问题**：只有还在「待确认」的问题可以撤回（进后台回收站，团队可恢复）；团队开始处理后不能自行删除，请在项目里留言。
- **修改密码**：「我的项目」页右上角，改完其他设备会自动退出。

## 技术栈

Vue 3 · Vite 5 · Element Plus · Fetch API · MediaRecorder · Sass

## 关联仓库

| 子项目 | GitHub 仓库 | 说明 |
| --- | --- | --- |
| 后端服务 | [xuancheng-order-backend](https://github.com/jiangyi3265/xuancheng-order-backend) | 订单、权限、日志、备份脚本等业务 API 与部署文档 |
| 管理后台 | [xuancheng-order-admin](https://github.com/jiangyi3265/xuancheng-order-admin) | 总管理员 / 下属管理员使用的后台 |
| 用户端 | [xuancheng-order-app](https://github.com/jiangyi3265/xuancheng-order-app) | 本仓库 |

## 本机开发

```bash
npm install
npm run dev
```

访问 `http://localhost:5174`。开发服务器把 `/jiedan`、`/login`、`/captchaImage` 代理到后端（默认 `http://localhost:8080`，被占用时用环境变量 `XC_BACKEND` 指向别处）。

> 语音录制依赖浏览器 MediaRecorder，需在 `localhost` 或 HTTPS 环境下使用；首次录音会请求麦克风权限。

部署到当前域名时，使用 `VITE_BASE=/client/ npm run build` 构建。

## 客户端接口

| 接口 | 说明 |
| --- | --- |
| `GET /jiedan/portal/orders` | 我的项目列表（按登录账号隔离） |
| `GET /jiedan/portal/orders/{id}` | 项目详情 + 沟通时间线 |
| `DELETE /jiedan/portal/orders/{id}` | 撤回问题（仅「待确认」可撤回） |
| `POST /jiedan/portal/message` | 发送留言（文字 / 图片 / 视频 / 语音） |
| `POST /jiedan/order/intake` | 提交新需求，归属当前登录账号 |
| `PUT /jiedan/account/password` | 修改自己的密码 |

## 当前部署

- 管理后台：https://jiedanxt.oksja.cn/
- 客户端：https://jiedanxt.oksja.cn/client/
- 后端由同域名 `/jiedan/**`、`/login`、`/captchaImage` 代理。
- GitHub Actions 只构建并保存产物，不自动部署。发布操作见后端仓库 `deploy/production.md`。
- 正式管理员密码单独交付；客户账号由管理员在后台「客户账号」中创建。线上没有预置演示数据。
