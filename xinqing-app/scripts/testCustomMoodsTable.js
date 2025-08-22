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

async function testAndCreateCustomMoodsTable() {
  console.log('🧪 测试 custom_moods 表是否存在...');
  
  // 第一步：尝试查询表来检查是否存在
  try {
    const { data, error } = await supabase
      .from('custom_moods')
      .select('*')
      .limit(1);
    
    if (!error) {
      console.log('✅ custom_moods 表已存在！');
      console.log(`📊 表中当前有 ${data ? data.length : 0} 条记录`);
      return true;
    }
    
    console.log('❌ 表不存在，错误:', error.message);
  } catch (e) {
    console.log('❌ 查询失败:', e.message);
  }
  
  // 第二步：尝试通过插入数据来测试表结构
  console.log('\n🔨 尝试通过数据操作来创建/测试表...');
  
  try {
    const testMood = {
      user_id: null, // 匿名用户
      name: '测试心情' + Date.now(),
      icon: '🎯',
      color: '#FF6B9D',
      description: '这是一个测试自定义心情'
    };
    
    console.log('📝 插入测试数据:', testMood.name);
    const { data, error } = await supabase
      .from('custom_moods')
      .insert(testMood)
      .select();
    
    if (error) {
      console.error('❌ 插入失败:', error.message);
      
      if (error.code === 'PGRST205') {
        console.log('\n📋 表不存在，请在 Supabase 控制台的 SQL Editor 中执行以下 SQL：\n');
        console.log(getCreateTableSQL());
        return false;
      } else if (error.code === '42501') {
        console.log('❌ 权限不足。可能需要 service role key 或在 Supabase 控制台中手动创建表。');
        return false;
      } else {
        console.log('❌ 其他错误，可能是表结构问题:', error);
        return false;
      }
    } else {
      console.log('✅ 数据插入成功！表已存在并且结构正确。');
      console.log('📄 插入的数据:', data);
      
      // 清理测试数据
      if (data && data[0] && data[0].id) {
        console.log('🧹 清理测试数据...');
        const { error: deleteError } = await supabase
          .from('custom_moods')
          .delete()
          .eq('id', data[0].id);
        
        if (!deleteError) {
          console.log('✅ 测试数据已清理');
        } else {
          console.log('⚠️  清理测试数据失败:', deleteError.message);
        }
      }
      
      return true;
    }
  } catch (insertError) {
    console.error('❌ 插入操作出错:', insertError.message);
    return false;
  }
}

function getCreateTableSQL() {
  return `-- 创建自定义心情表
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
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);`;
}

async function main() {
  console.log('🚀 开始检查和创建 custom_moods 表...\n');
  
  const success = await testAndCreateCustomMoodsTable();
  
  if (success) {
    console.log('\n🎉 成功！custom_moods 表已就绪，可以使用自定义心情功能了！');
    
    // 测试基本的 CRUD 操作
    console.log('\n🧪 测试基本操作...');
    
    try {
      // 测试添加自定义心情
      const testMood = {
        name: 'API测试心情',
        icon: '🚀',
        color: '#4ECDC4',
        description: '通过API创建的测试心情'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('custom_moods')
        .insert(testMood)
        .select();
      
      if (insertError) {
        console.log('❌ 插入测试失败:', insertError.message);
      } else {
        console.log('✅ 插入测试成功');
        
        // 测试查询
        const { data: selectData, error: selectError } = await supabase
          .from('custom_moods')
          .select('*');
        
        if (!selectError) {
          console.log(`✅ 查询测试成功，共 ${selectData.length} 条记录`);
        }
        
        // 清理测试数据
        if (insertData && insertData[0]) {
          await supabase
            .from('custom_moods')
            .delete()
            .eq('id', insertData[0].id);
          console.log('✅ 测试数据已清理');
        }
      }
      
    } catch (testError) {
      console.log('⚠️  基本操作测试失败:', testError.message);
    }
    
  } else {
    console.log('\n❌ 失败！请按照上面的指示在 Supabase 控制台中手动创建表。');
    console.log('\n💡 或者你可以继续使用本地存储版本的自定义心情功能。');
  }
}

main().catch(console.error);