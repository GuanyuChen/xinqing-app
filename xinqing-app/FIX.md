# 🚀 快速修复部署问题

## 问题解决

你遇到的两个问题已经修复：

### 1. ✅ 修复 `name` 属性 deprecated 警告
- 已从 `vercel.json` 中移除 deprecated 的 `name` 属性

### 2. ✅ 修复环境变量错误
- 移除了 vercel.json 中错误的环境变量引用

## 🔧 现在需要手动设置环境变量

在你的命令行中执行以下命令：

```bash
# 设置 Supabase URL
echo "https://qiqxttoczkaoanwfwbxn.supabase.co" | vercel env add REACT_APP_SUPABASE_URL production

# 设置 Supabase Anon Key  
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcXh0dG9jemthb2Fud2Z3YnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDUyNDgsImV4cCI6MjA3MTQyMTI0OH0.AedP8DVCr3j_-LB9B71Yj5sy6BaWPYc7jdzAonygIn4" | vercel env add REACT_APP_SUPABASE_ANON_KEY production

# 设置 Service Role Key
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcXh0dG9jemthb2Fud2Z3YnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDUyNDgsImV4cCI6MjA3MTQyMTI0OH0.AedP8DVCr3j_-LB9B71Yj5sy6BaWPYc7jdzAonygIn4" | vercel env add REACT_APP_SUPABASE_SERVICE_ROLE_KEY production

# 重新部署
vercel --prod
```

## 或者使用脚本

你也可以直接运行：
```bash
./set-env.sh
```

## 🎯 部署完成后

1. 访问 Vercel 提供的 URL
2. 测试应用功能
3. 检查心情记录是否能正常保存到 Supabase

## 💡 提示

如果还有问题，可以：
1. 在 Vercel 控制台手动添加环境变量
2. 查看部署日志获取详细错误信息
3. 确保 Supabase 数据库表已经创建