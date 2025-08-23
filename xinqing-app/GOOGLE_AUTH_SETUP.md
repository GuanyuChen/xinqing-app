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
   - `https://xinqing-app.vercel.app` (生产环境)
3. **⚠️ 生产环境特别注意**：还需添加应用回调URI
   - `https://xinqing-app.vercel.app/auth/callback`

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

## 🚀 生产环境部署配置

### 重要：生产环境回调URL配置

生产环境部署到 `https://xinqing-app.vercel.app` 需要特殊的回调URL配置：

#### 1. Supabase Dashboard 配置
**Authentication → URL Configuration**：
- **Site URL**: `https://xinqing-app.vercel.app`
- **Redirect URLs**: 添加 `https://xinqing-app.vercel.app/auth/callback`

#### 2. Google Cloud Console 配置
**已授权的重定向 URI** 中添加：
- `https://xinqing-app.vercel.app/auth/callback`

#### 3. 代码自动处理
应用代码已自动处理环境差异：
- **开发环境**: 重定向到 `http://localhost:3000/`
- **生产环境**: 重定向到 `https://xinqing-app.vercel.app/auth/callback`

#### 4. 认证流程
1. 用户在生产环境点击登录
2. 跳转到 Google OAuth 授权页面
3. 用户授权后重定向到 `/auth/callback`
4. 回调页面处理认证状态并跳转到主页

#### 5. 验证部署
部署完成后测试：
1. 访问 `https://xinqing-app.vercel.app`
2. 点击 "使用 Google 账号登录"
3. 完成授权后应该正确跳转到应用主页
4. 验证用户信息正确显示

⚠️ **关键提醒**：生产环境必须使用 `/auth/callback` 作为回调路径，这与开发环境的 `/` 路径不同！