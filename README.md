# 玄成科技接单系统用户端

玄成科技接单系统用户端是面向客户的公开需求提交入口，支持填写项目需求、联系方式、预算，并上传参考图、视频或文件，提交后由后端自动生成接单记录并进入管理后台流转。

## 技术栈

- Vue 3
- Vite 5
- Element Plus
- 文件粘贴 / 上传组件
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

默认访问地址为 `http://localhost:5174`。开发环境通过 `vite.config.js` 将 `/jiedan` 代理到后端服务，提交接口为 `/jiedan/order/intake`。

## 简历描述示例

拆分客户需求提交端，提供移动友好的公开表单和附件上传能力，让客户需求自动进入接单系统并同步到管理后台处理链路。
