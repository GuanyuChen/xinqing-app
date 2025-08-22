# 🚀 心情记录应用 - Vercel 部署指南

## 快速部署步骤

### 方法1: 通过 Vercel 网站部署（推荐）

1. **访问 Vercel**
   - 打开 https://vercel.com
   - 点击 "Sign Up" 或 "Log in"
   - 使用 GitHub 账号登录

2. **创建新项目**
   - 点击 "Add New..." → "Project"
   - 选择 "Import Git Repository"
   - 如果项目还未推送到 GitHub，先推送：
   ```bash
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```
   - 选择你的 xinqing-app 仓库

3. **配置项目**
   - Project Name: `xinqing-app` 或自定义名称
   - Framework Preset: 会自动检测为 "Create React App"
   - Root Directory: 保持默认 `./`
   - Build and Output Settings: 保持默认

4. **配置环境变量** ⚠️ 重要！
   在 "Environment Variables" 部分添加：
   ```
   Name: REACT_APP_SUPABASE_URL
   Value: https://qiqxttoczkaoanwfwbxn.supabase.co

   Name: REACT_APP_SUPABASE_ANON_KEY  
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcXh0dG9jemthb2Fud2Z3YnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDUyNDgsImV4cCI6MjA3MTQyMTI0OH0.AedP8DVCr3j_-LB9B71Yj5sy6BaWPYc7jdzAonygIn4

   Name: REACT_APP_SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcXh0dG9jemthb2Fud2Z3YnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDUyNDgsImV4cCI6MjA3MTQyMTI0OH0.AedP8DVCr3j_-LB9B71Yj5sy6BaWPYc7jdzAonygIn4
   ```

5. **部署**
   - 点击 "Deploy" 按钮
   - 等待构建完成（约2-3分钟）

### 方法2: 使用 Vercel CLI

1. **登录 Vercel**
   ```bash
   vercel login
   ```
   选择你的登录方式（推荐 GitHub）

2. **部署项目**
   ```bash
   vercel
   ```
   
   回答以下问题：
   - Set up and deploy "xinqing-app"? **Y**
   - Which scope? 选择你的账户
   - Link to existing project? **N** 
   - What's your project's name? **xinqing-app**
   - In which directory is your code located? **./（回车）**

3. **设置环境变量**
   ```bash
   vercel env add REACT_APP_SUPABASE_URL
   ```
   输入值: `https://qiqxttoczkaoanwfwbxn.supabase.co`
   
   ```bash
   vercel env add REACT_APP_SUPABASE_ANON_KEY
   ```
   输入你的 ANON KEY
   
   ```bash
   vercel env add REACT_APP_SUPABASE_SERVICE_ROLE_KEY
   ```
   输入你的 SERVICE ROLE KEY

4. **重新部署（带环境变量）**
   ```bash
   vercel --prod
   ```

## 部署后检查

1. **访问应用**
   - Vercel 会提供一个 URL，如：`https://xinqing-app.vercel.app`
   - 检查应用是否正常加载

2. **测试功能**
   - 尝试记录一条心情
   - 检查数据是否正确保存到 Supabase
   - 测试移动端响应式设计

3. **查看部署日志**
   - 在 Vercel 控制台查看构建和部署日志
   - 确认没有错误信息

## 自定义域名（可选）

1. 在 Vercel 项目设置中点击 "Domains"
2. 添加你的自定义域名
3. 按照提示配置 DNS 记录

## 环境变量管理

- 在 Vercel 项目设置的 "Environment Variables" 中管理
- 修改环境变量后需要重新部署
- 可以为不同环境（Development, Preview, Production）设置不同的值

## 故障排除

### 构建失败
- 检查 package.json 中的依赖版本
- 查看构建日志中的错误信息
- 确保所有环境变量都已正确设置

### 应用无法加载
- 检查浏览器控制台的错误信息
- 确认 Supabase 配置正确
- 检查网络请求是否成功

### 数据无法保存
- 确认 Supabase 数据库表已创建
- 检查 API 密钥是否有效
- 查看 Supabase 控制台的日志

## 🎉 完成！

部署成功后，你的心情记录应用就可以在全球范围内访问了！

- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS
- ✅ 无服务器架构
- ✅ 自动扩展
- ✅ 实时部署

每次推送到 GitHub 主分支都会自动触发新的部署。