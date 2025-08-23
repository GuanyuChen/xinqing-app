# Google 登录功能配置说明

## 🔐 完成的功能

✅ **用户认证系统**
- Google OAuth 登录集成
- Supabase Auth 认证流程
- 用户会话管理
- 强制登录验证

✅ **数据库表结构**
- 用户隔离的心情记录表 (`user_mood_records`)
- 用户隔离的自定义心情表 (`user_custom_moods`)  
- 行级安全策略 (RLS)
- 独立的存储桶 (`user-mood-media`)

✅ **前端组件更新**
- 登录页面组件
- 用户头像组件
- 认证状态管理
- 自动重定向逻辑

## 🚀 部署前必须配置

### 1. Supabase Dashboard 配置

**Authentication → Providers → Google**：
1. 启用 Google Provider
2. 设置 Google Client ID: `1092142891258-0dp8l4n66ktsisa7518dl74fj7v533ge.apps.googleusercontent.com`
3. 设置 Authorized redirect URIs: `https://qiqxttoczkaoanwfwbxn.supabase.co/auth/v1/callback`

### 2. Google Cloud Console 配置

**OAuth 2.0 客户端 ID**：
1. 添加授权重定向 URI: `https://qiqxttoczkaoanwfwbxn.supabase.co/auth/v1/callback`
2. 添加授权 JavaScript 源: 
   - `http://localhost:3000` (开发环境)
   - `https://xinqing-app.vercel.app` (生产环境 - **必须配置！**)

⚠️ **重要提醒**：如果生产环境登录后跳转到 `http://localhost:3000/#access_token`，说明 Google OAuth 配置中缺少生产域名。请确保在 Google Cloud Console 的 OAuth 2.0 客户端设置中添加 `https://xinqing-app.vercel.app` 作为授权 JavaScript 源。

### 3. 创建数据库表

运行以下命令创建用户认证相关表：

```bash
cd xinqing-app
node scripts/createUserAuthTables.js
```

或者在 Supabase Dashboard → SQL Editor 中执行 `database/user_auth_schema.sql`

## 📋 环境变量配置

确保 `.env` 文件包含：

```env
REACT_APP_SUPABASE_URL=https://qiqxttoczkaoanwfwbxn.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your_anon_key
REACT_APP_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔧 本地开发运行

1. 确保完成上述所有配置
2. 运行开发服务器：

```bash
cd xinqing-app
npm start
```

3. 访问 `http://localhost:3000`
4. 点击 "使用 Google 账号登录"

## 🏗️ 架构变更说明

### 数据隔离策略

- **新表**：完全独立的用户表，与匿名表并存
- **认证要求**：用户必须登录才能访问功能
- **数据安全**：RLS 策略确保用户只能访问自己的数据

### 前端架构

```
App.tsx
├── AuthProvider (认证上下文)
├── AppWithAuth (认证后的主应用)
│   ├── 已认证 → 显示主应用
│   └── 未认证 → 显示登录页面
└── LoginPage (登录组件)
```

### 数据存储层

- `UserMoodStorage`: 用户心情记录存储
- `UserCustomMoodStorage`: 用户自定义心情存储
- 所有操作都需要传入 `userId`

## ⚠️ 重要注意事项

1. **现有匿名数据不受影响**：新的用户系统与现有匿名数据完全独立
2. **强制登录**：用户必须使用 Google 账号登录才能使用功能
3. **数据安全**：RLS 策略确保用户数据完全隔离
4. **存储桶权限**：新的媒体文件存储在独立的用户存储桶中

## 🐛 常见问题排查

### Google 登录失败
1. 检查 Google Client ID 是否正确配置
2. 确认回调 URL 在 Google Console 中已添加
3. 检查 Supabase Auth 配置

### 数据库连接失败
1. 确认 Supabase URL 和密钥正确
2. 检查数据库表是否成功创建
3. 验证 RLS 策略是否启用

### 权限问题
1. 确认用户已正确认证
2. 检查 RLS 策略配置
3. 验证存储桶权限设置

## 📞 支持

如果遇到问题，请检查：
1. 浏览器开发者工具的控制台日志
2. Supabase Dashboard 的日志
3. 网络请求是否成功

## 🚨 生产环境常见问题

### 问题：登录后跳转到 `http://localhost:3000/#access_token`
**症状**：在生产环境 `https://xinqing-app.vercel.app` 登录 Google 后，页面跳转到 `http://localhost:3000/#access_token` 而不是生产环境域名。

**根本原因**：Google Cloud Console 的 OAuth 2.0 客户端配置中缺少生产环境域名。

**解决方案**：
1. 登录 [Google Cloud Console](https://console.cloud.google.com/)
2. 进入 "APIs & Services" → "Credentials"
3. 找到你的 OAuth 2.0 客户端 ID 并点击编辑
4. 在 "Authorized JavaScript origins" 中添加：
   - `https://xinqing-app.vercel.app`
5. 点击 "Save" 保存配置
6. 等待几分钟配置生效，然后重新测试登录

**验证修复**：
- 在生产环境登录后，URL 应该变为：`https://xinqing-app.vercel.app/#access_token=...`
- 控制台应该显示正确的重定向URL：`🔄 认证重定向URL: https://xinqing-app.vercel.app/`

### 其他检查项目
- 确认 Supabase Dashboard 的 Site URL 设置为 `https://xinqing-app.vercel.app`
- 确认 Redirect URLs 包含 `https://xinqing-app.vercel.app/`
- 检查浏览器控制台是否有错误信息