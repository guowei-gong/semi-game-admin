# 游戏管理后台 (Game Admin Frontend)

## 项目概述
基于 Semi Design 构建的游戏管理员后台系统。

## 技术栈
- **框架**: React 19 + TypeScript
- **构建工具**: Vite 7
- **UI 组件库**: Semi Design (@douyinfe/semi-ui-19，React 19 专用版本)
- **主题**: 飞书 Universe Design (@semi-bot/semi-theme-feishu1.0)
- **路由**: React Router DOM 7
- **图标**: @douyinfe/semi-icons + @douyinfe/semi-icons-lab（icons 包无需 React 19 专用版本）

## 项目结构
```
src/
├── layouts/          # 布局组件
│   ├── AdminLayout.tsx        # 管理后台主布局（顶部导航+左侧Nav）
│   └── AdminLayout.module.scss # 布局样式文件
├── pages/            # 页面组件
│   ├── Dashboard/        # 仪表盘
│   ├── UserManagement/   # 用户管理
│   ├── GameData/         # 游戏数据
│   ├── HotUpdate/        # 热更新
│   └── Login/            # 登录页
├── router/           # 路由配置
│   └── index.tsx
├── components/       # 公共组件（待开发）
├── styles/           # 全局样式（待开发）
├── App.tsx           # 应用入口
├── main.tsx          # 渲染入口
└── index.css         # 全局样式
```

## 功能模块
- [x] 登录页面（测试账号: admin / admin）
- [x] 仪表盘（数据概览、统计卡片）
- [x] 用户管理（用户列表、搜索、封禁）
- [x] 游戏数据（道具管理、关卡管理）
- [ ] 系统设置（开发中）

## 常用命令
```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产版本
npm run lint     # 代码检查
```

## Semi Design 资源
- 官网: https://semi.design/zh-CN/
- 组件文档: https://semi.design/zh-CN/start/getting-started
- 图标列表: https://semi.design/zh-CN/basic/icon

## 注意事项
- **React 19 兼容性**: 必须使用 `@douyinfe/semi-ui-19`，而非标准的 `@douyinfe/semi-ui`。标准版本会报 `findDOMNode is not a function` 错误
- **Tooltip/Dropdown 触发元素**: 在 React 19 中，Tooltip、Dropdown、Popover 等弹出层组件的 children 需要用真实 DOM 节点（如 `<span>`）包裹，否则会出现 `triggerEle should be a valid DOM element` 警告
- Semi Icons 中不存在 `IconGamepad`、`IconCoin` 等图标，需使用 `IconApps`、`IconCoinMoney` 等替代
- 使用图标前请先查阅官方图标文档确认图标名称

## 开发记录
- 2026-02-01: 项目初始化，完成基础框架搭建
- 2026-02-01: 修复图标导入错误（IconGamepad → IconApps, IconCoin → IconCoinMoney）
- 2026-02-01: 配置飞书 Universe Design 主题（使用 @douyinfe/vite-plugin-semi）
- 2026-02-01: 修复 React 19 兼容性问题 - 将 semi-ui 替换为 semi-ui-19（解决 findDOMNode 报错），semi-icons 保持不变
- 2026-02-01: 升级 AdminLayout 为 Semi Design 标准侧边导航模板（多级菜单、面包屑、Footer）
- 2026-02-02: 调整导航布局为顶部水平导航 + 左侧 Nav 模式（参考 template/n1.zip 模板）
  - 顶部导航：首页、管理中心、数据分析、系统设置
  - 左侧导航：使用 Nav 组件（垂直模式）替代 Tabs，解决图标文字对齐问题
  - 新增 @douyinfe/semi-icons-lab 图标库
  - 新增 AdminLayout.module.scss 样式文件
- 2026-02-02: 重构热更新页面第一步"检测表结构"的 UI 效果（参考 template/info.png 模板）
  - Hero 区域：左侧标题+描述+按钮，右侧模拟窗口示意图
  - Tab 切换区域：注意事项、更新记录
  - 保留后续步骤（上传配置、镜像重建、执行更新）的原有 UI
- 2026-02-02: 优化热更新页面交互逻辑
  - 注意事项 Tab：改为文本描述形式，分段落排版（配置审核、表结构变更、更新时机建议、回滚机制）
  - 更新记录 Tab：使用 List 组件重构，添加搜索功能，显示 Git SHA
  - Tab 顺序调整：更新记录在前，注意事项在后
  - Hero 区域：复选框确认"已阅读注意事项"，点击链接跳转到注意事项 Tab
  - 按钮固定宽度，避免 loading 状态时位置偏移
  - 移除功能亮点 Tab
- 2026-02-02: 简化热更新流程
  - 移除顶部分步进度条（Steps 组件）
  - 移除"上传配置"步骤
  - 合并"镜像重建确认"和"执行热更新"为"确认热更新"页面
  - 变更表格同时显示"结构变更"和"数据变更"类型
  - 仅在有结构变更时显示警告提示
  - 流程简化为：检测 → 确认热更新（含执行）
- 2026-02-03: 生成热更新模块 RESTful API 设计文档（`docs/hot-update-api.md`）
  - 5 个接口：检测变更、执行更新、查询执行状态、SSE 实时日志流、更新记录查询
  - 包含完整请求/响应结构、错误码、TypeScript 类型定义
  - 执行采用异步模式（返回 executionId，轮询或 SSE 获取进度）
- 2026-02-03: 热更新增加执行前锁检查
  - 点击「确认并开始热更新」前请求后端验证是否有其他管理员正在执行更新
  - 如有冲突，弹出 Modal 警告，显示占用人和开始时间
  - 新增 API：`POST /api/hot-update/pre-check`
- 2026-02-03: 热更新页面对接真实后端 API（后端地址 127.0.0.1:7777）
  - 移除所有模拟数据（mockUploadLogs、mockBuildLogs、mockRestartLogs、historyData）
  - 检测变更：`POST /api/hot-update/detect`
  - 执行更新：`POST /api/hot-update/execute` + 轮询 `GET /api/hot-update/executions/{id}`（1.5s 间隔）
  - 更新记录：`GET /api/hot-update/history`（支持服务端搜索，输入防抖 300ms）
  - 预检查：`POST /api/hot-update/pre-check`
  - Vite 代理配置：`/api` → `http://127.0.0.1:7777`
  - 新增执行失败时的错误 Banner 提示
