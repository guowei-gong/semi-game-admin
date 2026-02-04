# 热更新模块 RESTful API 设计文档

> 本文档由前端代码分析生成，供后端实现参考。
> 前端源码：`src/pages/HotUpdate/index.tsx`

## 业务流程概述

```
用户确认注意事项 → 开始检测 → 查看变更详情 → 预检查(锁检查) → 确认并执行热更新 → 实时查看执行日志
                                                                                ↓
                                                                更新记录（可搜索、分页）
```

热更新分为两种情况：
- **仅数据变更**：直接上传配置 → 重启服务
- **含结构变更**：上传配置 → 镜像重建 → 重启服务

---

## API 列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/hot-update/detect` | 检测配置变更 |
| POST | `/api/hot-update/pre-check` | 执行前锁检查（是否有其他管理员正在更新） |
| POST | `/api/hot-update/execute` | 执行热更新 |
| GET | `/api/hot-update/executions/{id}` | 查询执行状态与日志 |
| GET | `/api/hot-update/executions/{id}/stream` | SSE 实时日志流（可选） |
| GET | `/api/hot-update/history` | 查询更新记录 |

---

## 1. 检测配置变更

用户点击「开始检测」时调用，后端比对当前配置文件与已部署版本的差异。

### 请求

```
POST /api/hot-update/detect
Content-Type: application/json
```

请求体为空或可扩展为指定检测范围：

```json
{}
```

### 响应

```
200 OK
Content-Type: application/json
```

```json
{
  "code": 0,
  "data": {
    "hasSchemaChange": true,
    "changes": [
      {
        "name": "t_item",
        "type": "schema"
      },
      {
        "name": "t_level",
        "type": "data"
      },
      {
        "name": "t_config",
        "type": "data"
      }
    ],
    "configFiles": [
      "game_config.json",
      "item_config.json",
      "level_config.json"
    ]
  }
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `hasSchemaChange` | boolean | 是否存在表结构变更。为 true 时前端会显示警告提示，执行时增加「镜像重建」步骤 |
| `changes` | ChangeItem[] | 变更项列表 |
| `changes[].name` | string | 数据库表名 |
| `changes[].type` | `"schema"` \| `"data"` | 变更类型。`schema` = 结构变更（新增/修改字段等），`data` = 仅数据变更 |
| `configFiles` | string[] | 涉及的配置文件列表 |

### 错误情况

| code | 说明 |
|------|------|
| 1001 | 检测失败，无法连接配置仓库 |
| 1002 | 当前无待更新的配置 |

---

## 2. 执行前锁检查

用户在确认页面点击「确认并开始热更新」时，先调用此接口验证当前是否有其他管理员正在执行热更新。若被锁定，前端弹出 Modal 警告，阻止执行。

### 请求

```
POST /api/hot-update/pre-check
Content-Type: application/json
```

请求体为空：

```json
{}
```

### 响应 - 可执行

```
200 OK
Content-Type: application/json
```

```json
{
  "code": 0,
  "data": {
    "canExecute": true
  }
}
```

### 响应 - 被锁定

```json
{
  "code": 0,
  "data": {
    "canExecute": false,
    "lockedBy": "王运维",
    "lockedAt": "2026-02-03 14:20:05"
  }
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `canExecute` | boolean | 是否可以执行热更新 |
| `lockedBy` | string | 当 `canExecute` 为 false 时，正在执行更新的管理员姓名 |
| `lockedAt` | string | 当 `canExecute` 为 false 时，该管理员开始执行的时间 |

### 后端实现要点

- 当 `POST /api/hot-update/execute` 被调用时，后端应设置分布式锁（记录执行人和开始时间）
- 当执行完成（成功或失败）时释放锁
- 建议设置锁超时（如 30 分钟），防止异常情况下锁无法释放
- `pre-check` 仅做查询，不获取锁；真正获取锁在 `execute` 接口中

---

## 3. 执行热更新

用户在确认页面点击「确认并开始热更新」时调用。后端异步执行更新流程，返回执行 ID 供前端轮询状态。

### 请求

```
POST /api/hot-update/execute
Content-Type: application/json
```

```json
{
  "changes": [
    { "name": "t_item", "type": "schema" },
    { "name": "t_level", "type": "data" },
    { "name": "t_config", "type": "data" }
  ],
  "configFiles": [
    "game_config.json",
    "item_config.json",
    "level_config.json"
  ],
  "hasSchemaChange": true
}
```

### 响应

```
202 Accepted
Content-Type: application/json
```

```json
{
  "code": 0,
  "data": {
    "executionId": "exec_20260202_143218",
    "steps": ["upload", "build", "restart"]
  }
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `executionId` | string | 本次执行的唯一标识，用于后续查询状态 |
| `steps` | string[] | 将要执行的步骤列表。无结构变更时为 `["upload", "restart"]`，有结构变更时为 `["upload", "build", "restart"]` |

### 步骤说明

| step key | 名称 | 触发条件 |
|----------|------|----------|
| `upload` | 上传配置 | 始终执行 |
| `build` | 镜像重建 | 仅当 `hasSchemaChange === true` |
| `restart` | 重启服务 | 始终执行 |

---

## 4. 查询执行状态与日志

前端轮询此接口获取各步骤的执行状态和日志输出。建议轮询间隔 1-2 秒。

### 请求

```
GET /api/hot-update/executions/{executionId}
```

### 响应

```
200 OK
Content-Type: application/json
```

```json
{
  "code": 0,
  "data": {
    "executionId": "exec_20260202_143218",
    "status": "running",
    "steps": [
      {
        "key": "upload",
        "title": "上传配置",
        "status": "success",
        "duration": "10.2s",
        "logs": [
          { "time": "00:00:01", "content": "开始上传配置文件...", "type": "info" },
          { "time": "00:00:02", "content": "检测到 5 个配置文件", "type": "info" },
          { "time": "00:00:06", "content": "✓ 所有配置文件校验通过", "type": "success" },
          { "time": "00:00:10", "content": "✓ 上传完成", "type": "success" }
        ]
      },
      {
        "key": "build",
        "title": "镜像重建",
        "status": "running",
        "duration": null,
        "logs": [
          { "time": "00:00:01", "content": "检测到表结构变更，开始镜像重建...", "type": "warning" },
          { "time": "00:00:02", "content": "Pulling base image: game-server:latest", "type": "info" }
        ]
      },
      {
        "key": "restart",
        "title": "重启服务",
        "status": "idle",
        "duration": null,
        "logs": []
      }
    ]
  }
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | string | 整体执行状态：`running` / `success` / `error` |
| `steps[].key` | string | 步骤标识：`upload` / `build` / `restart` |
| `steps[].title` | string | 步骤名称（供前端直接展示） |
| `steps[].status` | string | `idle`（等待执行）/ `running`（执行中）/ `success`（成功）/ `error`（失败） |
| `steps[].duration` | string \| null | 步骤耗时，完成后填入（如 `"10.2s"`），未完成时为 null |
| `steps[].logs` | LogLine[] | 日志行列表 |
| `steps[].logs[].time` | string | 日志时间戳（相对时间，如 `"00:00:05"`） |
| `steps[].logs[].content` | string | 日志内容 |
| `steps[].logs[].type` | string | 日志级别：`info` / `success` / `error` / `warning`，前端据此渲染不同颜色 |

### 增量日志优化（建议）

为避免每次轮询返回全量日志，可支持 `since` 参数：

```
GET /api/hot-update/executions/{executionId}?logSince=15
```

`logSince` 为上次收到的最后一条日志的索引，后端仅返回该索引之后的新日志。

---

## 5. SSE 实时日志流（可选方案）

如果后端支持 SSE（Server-Sent Events），前端可使用此接口替代轮询，获得更好的实时体验。

### 请求

```
GET /api/hot-update/executions/{executionId}/stream
Accept: text/event-stream
```

### 事件格式

**日志事件：**
```
event: log
data: {"step":"upload","time":"00:00:03","content":"正在校验 game_config.json...","type":"info"}
```

**步骤状态变更事件：**
```
event: step-status
data: {"step":"upload","status":"success","duration":"10.2s"}
```

**整体完成事件：**
```
event: complete
data: {"status":"success"}
```

**错误事件：**
```
event: error
data: {"step":"build","message":"镜像构建失败：Dockerfile 语法错误"}
```

> 说明：SSE 和轮询方案二选一实现即可。如选择 SSE，仍建议保留查询接口（API 3）用于断线重连后恢复状态。

---

## 6. 查询更新记录

首页「更新记录」Tab 使用，支持关键词搜索和分页。

### 请求

```
GET /api/hot-update/history?keyword=张策划&page=1&pageSize=20
```

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `keyword` | string | 否 | 搜索关键词，匹配标题、执行人、commit hash |
| `page` | number | 否 | 页码，默认 1 |
| `pageSize` | number | 否 | 每页条数，默认 20 |

### 响应

```
200 OK
Content-Type: application/json
```

```json
{
  "code": 0,
  "data": {
    "total": 42,
    "page": 1,
    "pageSize": 20,
    "list": [
      {
        "id": 1,
        "title": "配置更新成功",
        "time": "2026-02-02 14:32:18",
        "executor": "张策划",
        "commit": "a1b2c3d4e5f6",
        "status": "success"
      },
      {
        "id": 2,
        "title": "配置更新成功",
        "time": "2026-02-01 10:15:42",
        "executor": "李开发",
        "commit": "b2c3d4e5f6g7",
        "status": "success"
      },
      {
        "id": 3,
        "title": "配置回滚",
        "time": "2026-01-31 16:28:05",
        "executor": "王运维",
        "commit": "c3d4e5f6g7h8",
        "status": "rollback"
      }
    ]
  }
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | number | 记录 ID |
| `title` | string | 更新标题 |
| `time` | string | 执行时间，格式 `YYYY-MM-DD HH:mm:ss` |
| `executor` | string | 执行人姓名 |
| `commit` | string | Git commit hash（短格式，12 位） |
| `status` | string | 状态：`success`（成功）/ `rollback`（回滚）/ `failed`（失败） |

---

## 通用约定

### 响应格式

所有接口统一使用以下响应结构：

```json
{
  "code": 0,
  "message": "success",
  "data": { }
}
```

| 字段 | 说明 |
|------|------|
| `code` | 0 = 成功，非 0 = 错误码 |
| `message` | 成功时为 `"success"`，失败时为错误描述 |
| `data` | 业务数据，失败时可为 null |

### 认证

所有接口需要携带认证信息（待前端登录模块对接后补充具体方案，如 JWT Token in Authorization header）。

### 错误码汇总

| code | 说明 |
|------|------|
| 0 | 成功 |
| 1001 | 检测失败，无法连接配置仓库 |
| 1002 | 当前无待更新的配置 |
| 2000 | 预检查失败，无法获取锁状态 |
| 2001 | 执行失败，当前有正在进行的更新任务（锁冲突） |
| 2002 | 执行 ID 不存在 |
| 2003 | 上传配置失败 |
| 2004 | 镜像重建失败 |
| 2005 | 服务重启失败 |
| 9999 | 服务器内部错误 |

---

## 前端对接要点

1. **检测接口**调用后，前端将 `DetectResult` 存入本地状态，进入确认页展示变更详情
2. **执行接口**返回 `executionId` 后，前端切换到执行页，开始轮询状态接口或连接 SSE
3. **日志展示**：前端按 `steps` 数组顺序渲染执行步骤，每个步骤可展开/折叠查看日志
4. **步骤动态性**：`build`（镜像重建）步骤仅在 `hasSchemaChange === true` 时出现
5. **更新记录**：前端当前使用纯前端搜索，对接后端后改为服务端搜索（`keyword` 参数）

---

## TypeScript 类型参考

以下类型定义摘自前端代码，供后端参考数据结构：

```typescript
// 预检查结果（POST /api/hot-update/pre-check 响应）
interface PreCheckResult {
  canExecute: boolean;
  lockedBy?: string;    // 占用人姓名
  lockedAt?: string;    // 占用开始时间
}

// 变更项
interface ChangeItem {
  name: string;           // 数据库表名
  type: 'schema' | 'data'; // schema: 结构变更, data: 数据变更
}

// 检测结果（POST /api/hot-update/detect 响应）
interface DetectResult {
  hasSchemaChange: boolean;
  changes: ChangeItem[];
  configFiles: string[];
}

// 日志行
interface LogLine {
  time: string;                              // 相对时间 "00:00:05"
  content: string;                           // 日志内容
  type?: 'info' | 'success' | 'error' | 'warning'; // 日志级别
}

// 执行步骤状态
type ExecutionStatus = 'idle' | 'running' | 'success' | 'error';

// 执行步骤（GET /api/hot-update/executions/{id} 响应中的 steps 元素）
interface ExecutionStep {
  key: string;            // 步骤标识: upload / build / restart
  title: string;          // 步骤名称
  status: ExecutionStatus;
  logs: LogLine[];
  duration?: string;      // 耗时，如 "10.2s"
}

// 更新记录项（GET /api/hot-update/history 响应中的 list 元素）
interface HistoryItem {
  id: number;
  title: string;
  time: string;           // "YYYY-MM-DD HH:mm:ss"
  executor: string;
  commit: string;         // Git SHA 短格式
  status: 'success' | 'rollback' | 'failed';
}
```
