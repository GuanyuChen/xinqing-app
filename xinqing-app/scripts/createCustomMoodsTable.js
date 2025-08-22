const { createClient } = require('@supabase/supabase-js');

// 从环境变量读取 Supabase 配置
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 请确保 .env 文件中配置了 REACT_APP_SUPABASE_URL 和 REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCustomMoodsTable() {
  console.log('🔧 开始创建 custom_moods 表...');
  
  try {
    // 首先检查表是否已存在
    const { data: existingData } = await supabase
      .from('custom_moods')
      .select('*')
      .limit(1);
    
    if (existingData) {
      console.log('✅ custom_moods 表已存在，无需创建');
      return;
    }
  } catch (error) {
    console.log('📝 custom_moods 表不存在，将创建新表');
  }
  
  // 直接插入一个测试记录来检查表是否存在和结构是否正确
  try {
    const testMood = {
      user_id: null,
      name: '测试心情',
      icon: '🎯',
      color: '#FF6B9D',
      description: '这是一个测试心情',
    };
    
    const { data, error } = await supabase
      .from('custom_moods')
      .insert(testMood)
      .select()
      .single();
    
    if (error) {
      console.error('❌ 创建测试记录失败，表可能不存在:', error);
      console.log('📋 请在 Supabase 控制台的 SQL Editor 中执行以下 SQL:');
      console.log(`
-- 创建自定义心情表
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
      `);
    } else {
      console.log('✅ custom_moods 表创建成功！');
      console.log('🧹 删除测试记录...');
      
      // 删除测试记录
      await supabase
        .from('custom_moods')
        .delete()
        .eq('id', data.id);
        
      console.log('✅ 测试完成，表已就绪');
    }
    
  } catch (error) {
    console.error('❌ 操作失败:', error);
  }
}

createCustomMoodsTable();