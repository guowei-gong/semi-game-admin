# 登录认证模块 RESTful API 设计文档

> 本文档由前端代码分析生成，供后端实现参考。
> 前端源码：`src/pages/Login/index.tsx`

## API 列表

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/auth/login` | 用户登录 |

---

## 1. 用户登录

### 请求

```
POST /api/auth/login
Content-Type: application/json
```

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `email` | string | 是 | 用户邮箱 |
| `password` | string | 是 | 用户密码 |

### 响应 - 登录成功

```
200 OK
Content-Type: application/json
```

```json
{
  "code": 0,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "管理员",
      "email": "admin@example.com",
      "avatar": "https://example.com/avatar.png"
    }
  }
}
```

### 响应 - 登录失败

```json
{
  "code": 3001,
  "message": "邮箱或密码错误",
  "data": null
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `token` | string | JWT Token，前端存储到 localStorage，后续请求通过 Authorization header 携带 |
| `user.id` | number | 用户 ID |
| `user.name` | string | 用户姓名 |
| `user.email` | string | 用户邮箱 |
| `user.avatar` | string | 用户头像 URL |

---

## 错误码

| code | 说明 |
|------|------|
| 0 | 成功 |
| 3001 | 邮箱或密码错误 |
| 3002 | 账号已被禁用 |
| 3003 | 请求参数缺失（email 或 password 为空） |

> 注意：错误码使用 3xxx 段，避免与热更新模块（1xxx/2xxx）冲突。

---

## 前端对接要点

1. 登录成功后将 `token` 存入 `localStorage`，key 为 `token`
2. 登录成功后跳转到 `/dashboard`
3. 登录失败时根据后端返回的 `message` 显示 Notification 错误通知
4. 网络异常时显示 "登录请求失败，请检查网络连接"
5. 表单提交前进行前端校验，邮箱和密码均为必填

---

## TypeScript 类型参考

```typescript
// 登录请求体
interface LoginRequest {
  email: string;
  password: string;
}

// 用户信息
interface UserInfo {
  id: number;
  name: string;
  email: string;
  avatar: string;
}

// 登录成功响应
interface LoginSuccessResponse {
  code: 0;
  data: {
    token: string;
    user: UserInfo;
  };
}

// 登录失败响应
interface LoginErrorResponse {
  code: number; // 3001 | 3002 | 3003
  message: string;
  data: null;
}
```
