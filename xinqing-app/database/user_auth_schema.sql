-- 用户认证版本的数据库表结构
-- 此脚本创建新的用户隔离表，不影响现有匿名表

-- 用户心情记录表（仅认证用户）
CREATE TABLE user_mood_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  mood TEXT NOT NULL, -- 支持预定义和自定义心情
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 5),
  diary TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  audio_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- 每个用户每天只能有一条记录
  UNIQUE(user_id, date)
);

-- 用户自定义心情表（仅认证用户）
CREATE TABLE user_custom_moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (LENGTH(name) > 0 AND LENGTH(name) <= 20),
  icon TEXT NOT NULL CHECK (LENGTH(icon) > 0 AND LENGTH(icon) <= 10),
  color TEXT NOT NULL CHECK (LENGTH(color) > 0 AND LENGTH(color) <= 20),
  description TEXT NOT NULL CHECK (LENGTH(description) > 0 AND LENGTH(description) <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- 每个用户的自定义心情名称唯一
  UNIQUE(user_id, name)
);

-- 创建索引以提高查询性能
CREATE INDEX idx_user_mood_records_user_date ON user_mood_records(user_id, date);
CREATE INDEX idx_user_mood_records_date ON user_mood_records(date);
CREATE INDEX idx_user_mood_records_mood ON user_mood_records(mood);
CREATE INDEX idx_user_mood_records_created_at ON user_mood_records(created_at);

CREATE INDEX idx_user_custom_moods_user_id ON user_custom_moods(user_id);
CREATE INDEX idx_user_custom_moods_name ON user_custom_moods(name);

-- 自动更新 updated_at 字段的触发器
CREATE OR REPLACE FUNCTION update_user_mood_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_mood_records_updated_at 
    BEFORE UPDATE ON user_mood_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_user_mood_records_updated_at();

-- 行级安全策略（RLS）
ALTER TABLE user_mood_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_custom_moods ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的记录
CREATE POLICY "Users can view own mood records" ON user_mood_records
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood records" ON user_mood_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood records" ON user_mood_records
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood records" ON user_mood_records
    FOR DELETE USING (auth.uid() = user_id);

-- 自定义心情表的 RLS 策略
CREATE POLICY "Users can view own custom moods" ON user_custom_moods
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom moods" ON user_custom_moods
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom moods" ON user_custom_moods
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom moods" ON user_custom_moods
    FOR DELETE USING (auth.uid() = user_id);

-- 为认证用户创建独立的存储桶
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-mood-media', 'user-mood-media', true)
ON CONFLICT (id) DO NOTHING;

-- 存储桶策略 - 只允许认证用户访问
CREATE POLICY "Allow authenticated users read access on user mood media" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-mood-media' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to upload user mood media" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-mood-media' 
        AND auth.role() = 'authenticated' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Allow users to update their own user mood media" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-mood-media' 
        AND auth.role() = 'authenticated' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

CREATE POLICY "Allow users to delete their own user mood media" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-mood-media' 
        AND auth.role() = 'authenticated' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- 创建有用的视图
CREATE VIEW user_mood_stats AS
SELECT 
    user_id,
    COUNT(*) as total_records,
    AVG(intensity) as avg_intensity,
    mode() WITHIN GROUP (ORDER BY mood) as most_common_mood,
    MIN(date) as first_record_date,
    MAX(date) as last_record_date
FROM user_mood_records
GROUP BY user_id;

-- 创建月度统计视图
CREATE VIEW user_monthly_mood_stats AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    COUNT(*) as records_count,
    AVG(intensity) as avg_intensity,
    mode() WITHIN GROUP (ORDER BY mood) as dominant_mood,
    COUNT(DISTINCT mood) as mood_variety
FROM user_mood_records
GROUP BY user_id, DATE_TRUNC('month', date)
ORDER BY user_id, month;