# Chat

一个基于 `Electron + Vue 3 + TypeScript + Vite` 的桌面聊天界面示例项目。

当前项目主要用于聊天类应用的界面搭建与交互验证，已包含基础的会话列表、消息面板、左侧导航和设置页结构。

## 功能概览

- 会话列表展示
- 消息内容展示
- 左侧导航切换
- 设置页基础结构
- 基于 Pinia 的本地状态管理

## 技术栈

- Electron
- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router

## 本地开发

安装依赖：

```bash
npm install
```

启动开发环境：

```bash
npm run dev
```

构建项目：

```bash
npm run build
```

## 目录说明

- `src/main`：Electron 主进程相关代码
- `src/renderer`：渲染进程页面与组件
- `src/model`：基础数据模型定义

## 说明

当前仓库以界面原型和功能迭代为主，适合继续补充聊天搜索、会话管理、联系人页和消息发送等功能。
