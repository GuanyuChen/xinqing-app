-- 自定义心情表
CREATE TABLE custom_moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (LENGTH(name) > 0 AND LENGTH(name) <= 20),
  icon TEXT NOT NULL CHECK (LENGTH(icon) > 0 AND LENGTH(icon) <= 10),
  color TEXT NOT NULL CHECK (LENGTH(color) > 0 AND LENGTH(color) <= 20),
  description TEXT NOT NULL CHECK (LENGTH(description) > 0 AND LENGTH(description) <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- 确保每个用户的自定义心情名称唯一
  UNIQUE(user_id, name)
);

-- 为匿名用户（无 user_id）确保心情名称唯一
CREATE UNIQUE INDEX custom_moods_anonymous_name_unique 
ON custom_moods (name) 
WHERE user_id IS NULL;

-- 创建索引
CREATE INDEX idx_custom_moods_user_id ON custom_moods(user_id);
CREATE INDEX idx_custom_moods_name ON custom_moods(name);

-- 心情记录表
CREATE TABLE mood_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  mood TEXT NOT NULL, -- 移除 CHECK 约束以支持自定义心情
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 5),
  diary TEXT NOT NULL DEFAULT '',
  photo_url TEXT,
  audio_url TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- 确保每个用户每天只能有一条记录
  UNIQUE(user_id, date)
);

-- 为匿名用户（无 user_id）确保每天只有一条记录
CREATE UNIQUE INDEX mood_records_anonymous_date_unique 
ON mood_records (date) 
WHERE user_id IS NULL;

-- 创建索引以提高查询性能
CREATE INDEX idx_mood_records_user_date ON mood_records(user_id, date);
CREATE INDEX idx_mood_records_date ON mood_records(date);
CREATE INDEX idx_mood_records_mood ON mood_records(mood);
CREATE INDEX idx_mood_records_created_at ON mood_records(created_at);

-- 自动更新 updated_at 字段的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_mood_records_updated_at 
    BEFORE UPDATE ON mood_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 行级安全策略（RLS）
ALTER TABLE mood_records ENABLE ROW LEVEL SECURITY;

-- 用户只能访问自己的记录
CREATE POLICY "Users can view own mood records" ON mood_records
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own mood records" ON mood_records
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own mood records" ON mood_records
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own mood records" ON mood_records
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- 自定义心情表的 RLS 策略
ALTER TABLE custom_moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom moods" ON custom_moods
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own custom moods" ON custom_moods
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own custom moods" ON custom_moods
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own custom moods" ON custom_moods
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- 创建存储桶用于媒体文件
INSERT INTO storage.buckets (id, name, public)
VALUES ('mood-media', 'mood-media', true)
ON CONFLICT (id) DO NOTHING;

-- 存储桶策略
CREATE POLICY "Allow public read access on mood media" ON storage.objects
    FOR SELECT USING (bucket_id = 'mood-media');

CREATE POLICY "Allow authenticated users to upload mood media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'mood-media' AND auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own mood media" ON storage.objects
    FOR UPDATE USING (bucket_id = 'mood-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own mood media" ON storage.objects
    FOR DELETE USING (bucket_id = 'mood-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 匿名用户也可以上传（可选，根据需求决定）
CREATE POLICY "Allow anonymous users to upload mood media" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'mood-media');

-- 创建一些有用的视图
CREATE VIEW mood_stats AS
SELECT 
    user_id,
    COUNT(*) as total_records,
    AVG(intensity) as avg_intensity,
    mode() WITHIN GROUP (ORDER BY mood) as most_common_mood,
    MIN(date) as first_record_date,
    MAX(date) as last_record_date
FROM mood_records
GROUP BY user_id;

-- 创建月度统计视图
CREATE VIEW monthly_mood_stats AS
SELECT 
    user_id,
    DATE_TRUNC('month', date) as month,
    COUNT(*) as records_count,
    AVG(intensity) as avg_intensity,
    mode() WITHIN GROUP (ORDER BY mood) as dominant_mood,
    COUNT(DISTINCT mood) as mood_variety
FROM mood_records
GROUP BY user_id, DATE_TRUNC('month', date)
ORDER BY user_id, month;