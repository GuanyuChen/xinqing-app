# Vercel 部署配置

## 环境变量设置

为了让 GitHub Actions 能够自动部署到 Vercel，需要在 GitHub 仓库设置中添加以下 secrets：

### 1. 获取 Vercel Token
1. 访问 [Vercel Dashboard](https://vercel.com/account/tokens)
2. 创建新的 token
3. 复制生成的 token

### 2. 获取 Vercel 项目信息
在项目根目录运行：
```bash
npx vercel link
```
这会生成 `.vercel/project.json` 文件，包含：
- `orgId`: 组织 ID
- `projectId`: 项目 ID

### 3. 在 GitHub 仓库中设置 Secrets
前往 GitHub 仓库 → Settings → Secrets and variables → Actions，添加：

- `VERCEL_TOKEN`: 上面获取的 Vercel token
- `VERCEL_ORG_ID`: .vercel/project.json 中的 orgId
- `VERCEL_PROJECT_ID`: .vercel/project.json 中的 projectId

## 工作流说明

创建的 GitHub Actions workflow (`.github/workflows/deploy.yml`) 会在：
- Pull Request 被合并到 main 分支时自动触发
- 自动构建项目并部署到 Vercel 生产环境

## 手动部署 (可选)

如需手动部署到 Vercel：
```bash
cd xinqing-app
npx vercel --prod
```