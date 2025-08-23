# 数据库表创建说明

由于 Service Role Key 可能有权限限制，请在 Supabase Dashboard 中手动创建表：

## 方法1：通过 Supabase Dashboard

1. 打开 Supabase Dashboard: https://supabase.com/dashboard
2. 选择你的项目: qiqxttoczkaoanwfwbxn
3. 进入 **SQL Editor** 
4. 复制粘贴 `database/user_auth_schema.sql` 中的所有内容
5. 点击 **Run** 执行

## 方法2：分步骤创建

如果一次性执行失败，可以分步骤执行：

### 1. 创建用户心情记录表
```sql
CREATE TABLE user_mood_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  mood TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 5),
  diary TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  audio_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, date)
);
```

### 2. 创建用户自定义心情表
```sql  
CREATE TABLE user_custom_moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (LENGTH(name) > 0 AND LENGTH(name) <= 20),
  icon TEXT NOT NULL CHECK (LENGTH(icon) > 0 AND LENGTH(icon) <= 10),
  color TEXT NOT NULL CHECK (LENGTH(color) > 0 AND LENGTH(color) <= 20),
  description TEXT NOT NULL CHECK (LENGTH(description) > 0 AND LENGTH(description) <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, name)
);
```

### 3. 启用 RLS 和创建策略
```sql
ALTER TABLE user_mood_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own mood records" ON user_mood_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood records" ON user_mood_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 继续执行剩余策略...
```

创建完成后，你就可以正常使用 Google 登录功能了！