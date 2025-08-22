# Vercel 部署指南

## 自动部署步骤

1. **推送到 GitHub**
   ```bash
   git init
   git add .
   git commit -m "🎉 Initial commit: 心情记录应用"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **连接 Vercel**
   - 访问 [vercel.com](https://vercel.com)
   - 使用 GitHub 账号登录
   - 点击 "Add New" → "Project"
   - 选择你的 GitHub 仓库
   - 点击 "Deploy"

3. **配置环境变量**
   在 Vercel 项目设置中添加以下环境变量：
   ```
   REACT_APP_SUPABASE_URL=https://qiqxttoczkaoanwfwbxn.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcXh0dG9jemthb2Fud2Z3YnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDUyNDgsImV4cCI6MjA3MTQyMTI0OH0.AedP8DVCr3j_-LB9B71Yj5sy6BaWPYc7jdzAonygIn4
   REACT_APP_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcXh0dG9jemthb2Fud2Z3YnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDUyNDgsImV4cCI6MjA3MTQyMTI0OH0.AedP8DVCr3j_-LB9B71Yj5sy6BaWPYc7jdzAonygIn4
   ```

## 使用 Vercel CLI 部署

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   vercel
   ```

4. **设置环境变量**
   ```bash
   vercel env add REACT_APP_SUPABASE_URL
   vercel env add REACT_APP_SUPABASE_ANON_KEY
   vercel env add REACT_APP_SUPABASE_SERVICE_ROLE_KEY
   ```

5. **重新部署**
   ```bash
   vercel --prod
   ```

## 项目特点

- ✅ 单页面应用 (SPA)
- ✅ 响应式设计，支持移动端
- ✅ PWA 支持
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动优化构建

## 域名配置

部署完成后可以：
1. 使用 Vercel 提供的免费域名
2. 在 Vercel 项目设置中添加自定义域名
3. 配置 DNS 记录指向 Vercel

## 注意事项

- 确保 Supabase 数据库表已创建
- 环境变量必须在 Vercel 控制台中配置
- 首次部署可能需要几分钟时间