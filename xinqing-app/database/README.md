# Supabase 数据库设置指南

## 1. 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并创建账户
2. 点击 "New Project" 创建新项目
3. 选择组织，输入项目名称（如：xinqing-mood-app）
4. 设置数据库密码
5. 选择地区（建议选择离用户最近的地区）

## 2. 获取项目配置

1. 在项目控制台中，进入 "Settings" > "API"
2. 复制以下信息：
   - `Project URL`
   - `anon` `public` key

## 3. 配置环境变量

将获取的配置信息填入 `.env` 文件：

```bash
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. 创建数据库表

1. 在 Supabase 控制台中，进入 "SQL Editor"
2. 创建新查询，复制 `database/schema.sql` 中的内容
3. 执行 SQL 语句创建表和相关配置

## 5. 设置存储桶

存储桶用于存储用户上传的图片和音频文件：

1. 进入 "Storage" 页面
2. 如果 `mood-media` 桶不存在，请创建它
3. 设置桶为公共访问（允许匿名读取）

## 6. 配置身份验证（可选）

如果需要用户登录功能：

1. 进入 "Authentication" > "Settings"
2. 配置所需的身份验证提供商
3. 设置重定向 URL

## 7. 行级安全策略（RLS）

数据库已配置 RLS 策略：
- 用户只能访问自己的记录
- 匿名用户可以创建和访问匿名记录
- 媒体文件具有相应的访问控制

## 8. 数据库表结构

### mood_records 表

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | UUID | 主键 |
| user_id | UUID | 用户ID（外键，可为空） |
| date | DATE | 记录日期 |
| mood | TEXT | 情绪类型 |
| intensity | INTEGER | 情绪强度（1-5） |
| diary | TEXT | 日记内容 |
| photo_url | TEXT | 图片URL |
| audio_url | TEXT | 音频URL |
| tags | TEXT[] | 标签数组 |
| created_at | TIMESTAMP | 创建时间 |
| updated_at | TIMESTAMP | 更新时间 |

### 约束和索引

- 每个用户每天只能有一条记录
- 匿名用户每天也只能有一条记录
- 情绪类型限制为预定义值
- 情绪强度必须在 1-5 之间

## 9. 错误排查

### 连接问题
- 检查 URL 和密钥是否正确
- 确保项目处于活跃状态
- 检查网络连接

### 权限问题
- 确认 RLS 策略配置正确
- 检查用户身份验证状态
- 验证存储桶权限设置

### 数据问题
- 确认数据格式符合表结构
- 检查必填字段是否为空
- 验证数据类型是否正确

## 10. 本地开发

应用支持离线模式，会自动：
- 检测 Supabase 连接状态
- 在连接失败时回退到本地存储
- 提供统一的数据接口

这样确保应用在没有网络或 Supabase 服务不可用时仍能正常工作。