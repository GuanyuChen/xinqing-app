const fetch = require('node-fetch');

// 从环境变量读取 Supabase 配置
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 请确保 .env 文件中配置了 REACT_APP_SUPABASE_URL 和 REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

async function createTableViaHTTP() {
  console.log('🌐 尝试通过 HTTP API 创建表...');
  
  const sql = `
CREATE TABLE custom_moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (LENGTH(name) > 0 AND LENGTH(name) <= 20),
  icon TEXT NOT NULL CHECK (LENGTH(icon) > 0 AND LENGTH(icon) <= 10),
  color TEXT NOT NULL CHECK (LENGTH(color) > 0 AND LENGTH(color) <= 20),
  description TEXT NOT NULL CHECK (LENGTH(description) > 0 AND LENGTH(description) <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, name)
);

CREATE UNIQUE INDEX custom_moods_anonymous_name_unique 
ON custom_moods (name) 
WHERE user_id IS NULL;

CREATE INDEX idx_custom_moods_user_id ON custom_moods(user_id);
CREATE INDEX idx_custom_moods_name ON custom_moods(name);

ALTER TABLE custom_moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own custom moods" ON custom_moods
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own custom moods" ON custom_moods
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own custom moods" ON custom_moods
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own custom moods" ON custom_moods
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);`;

  try {
    // 尝试通过 Supabase 的 SQL RPC endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({ query: sql })
    });
    
    const result = await response.text();
    console.log('📄 响应:', result);
    
    if (response.ok) {
      console.log('✅ 通过 HTTP API 创建表成功！');
      return true;
    } else {
      console.log('❌ HTTP API 请求失败:', response.status, result);
    }
    
  } catch (error) {
    console.log('❌ HTTP API 调用出错:', error.message);
  }
  
  return false;
}

async function main() {
  console.log('🚀 尝试多种方法创建 custom_moods 表...\n');
  
  // 尝试 HTTP API
  const httpSuccess = await createTableViaHTTP();
  
  if (!httpSuccess) {
    console.log('\n💡 所有自动创建方法都失败了。这是正常的，因为 Supabase 限制了通过 API 执行 DDL 操作。');
    console.log('\n✨ 好消息是：我已经实现了本地存储方案，自定义心情功能现在就可以正常工作！');
    console.log('\n🎯 如果你想使用云存储（可选），请：');
    console.log('1. 打开 Supabase 控制台');
    console.log('2. 进入 SQL Editor');
    console.log('3. 执行下面的 SQL 语句：');
    console.log('\n' + '='.repeat(60));
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
  UNIQUE(user_id, name)
);

-- 为匿名用户确保心情名称唯一
CREATE UNIQUE INDEX custom_moods_anonymous_name_unique 
ON custom_moods (name) 
WHERE user_id IS NULL;

-- 创建索引
CREATE INDEX idx_custom_moods_user_id ON custom_moods(user_id);
CREATE INDEX idx_custom_moods_name ON custom_moods(name);

-- 启用行级安全
ALTER TABLE custom_moods ENABLE ROW LEVEL SECURITY;

-- 创建访问策略
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
    console.log('='.repeat(60));
    console.log('\n🎉 执行完成后，自定义心情将自动从本地存储升级到云存储！');
  } else {
    console.log('🎉 表创建成功！');
  }
}

main().catch(console.error);