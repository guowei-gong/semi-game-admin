# 游戏管理后台 (Game Admin Frontend)

## 项目概述
基于 Semi Design 构建的游戏管理员后台系统。

## 技术栈
- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **UI 组件库**: Semi Design (@douyinfe/semi-ui-19，React 19 专用版本)
- **主题**: 飞书 Universe Design (@semi-bot/semi-theme-feishu1.0)
- **路由**: React Router DOM 7
- **图标**: @douyinfe/semi-icons（icons 包无需 React 19 专用版本）

## 项目结构
```
src/
├── layouts/          # 布局组件
│   ├── AdminLayout.tsx        # 管理后台主布局（顶部导航+左侧Tabs）
│   └── AdminLayout.module.scss # 布局样式文件
├── pages/            # 页面组件
│   ├── Dashboard/        # 仪表盘
│   ├── UserManagement/   # 用户管理
│   ├── GameData/         # 游戏数据
│   └── Login/            # 登录页
├── router/           # 路由配置
│   └── index.tsx
├── components/       # 公共组件（待开发）
├── styles/           # 全局样式（待开发）
├── App.tsx           # 应用入口
├── main.tsx          # 渲染入口
└── index.css         # 全局样式
```