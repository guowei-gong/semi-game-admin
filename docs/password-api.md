# 修改密码 RESTful API 设计文档

> 本文档由前端代码分析生成，供后端实现参考。
> 前端源码：`src/pages/AccountSettings/index.tsx`

## API 列表

| 方法 | 路径 | 说明 |
|------|------|------|
| PUT | `/api/auth/password` | 修改当前用户密码 |

---

## 1. 修改密码

### 请求

```
PUT /api/auth/password
Content-Type: application/json
Authorization: Bearer <token>
```

```json
{
  "oldPassword": "current123",
  "newPassword": "newpass456"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `oldPassword` | string | 是 | 当前密码 |
| `newPassword` | string | 是 | 新密码（最少 6 个字符） |

### 响应 - 修改成功

```
200 OK
Content-Type: application/json
```

```json
{
  "code": 0,
  "message": "密码修改成功",
  "data": null
}
```

### 响应 - 修改失败

```json
{
  "code": 3101,
  "message": "当前密码错误",
  "data": null
}
```

---

## 错误码

| code | 说明 |
|------|------|
| 0 | 成功 |
| 3101 | 当前密码错误 |
| 3102 | 新密码不符合要求（长度不足 6 位等） |
| 3103 | 新密码不能与当前密码相同 |
| 3104 | 请求参数缺失（oldPassword 或 newPassword 为空） |

> 注意：错误码使用 31xx 段，属于认证模块（3xxx）下的密码子模块。

---

## 认证方式

请求必须在 Header 中携带有效的 JWT Token：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

未携带 Token 或 Token 已过期时，后端应返回 HTTP 401，前端会自动清除本地 Token 并跳转到登录页。

---

## 前端对接要点

1. 前端通过 `request` 工具函数发起请求，自动携带 `Authorization` Header
2. 前端已做前置校验：两次输入的新密码是否一致、字段必填、最少 6 个字符
3. 修改成功后前端显示 Toast 成功提示并清空表单
4. 修改失败时前端根据后端返回的 `message` 显示 Toast 错误提示
5. 密码修改成功后**无需**重新登录（Token 保持不变）

---

## TypeScript 类型参考

```typescript
// 修改密码请求体
interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

// 成功响应
interface ChangePasswordSuccessResponse {
  code: 0;
  message: string;
  data: null;
}

// 失败响应
interface ChangePasswordErrorResponse {
  code: number; // 3101 | 3102 | 3103 | 3104
  message: string;
  data: null;
}
```
