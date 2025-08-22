const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// 从环境变量读取 Supabase 配置
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 请确保 .env 文件中配置了 REACT_APP_SUPABASE_URL 和 REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

// 使用 service role key 来执行管理操作
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQL(sql) {
  try {
    console.log('🔧 执行 SQL:', sql.substring(0, 100) + '...');
    
    // 使用 rpc 调用执行原始 SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_statement: sql 
    });
    
    if (error) {
      // 如果 exec_sql 函数不存在，尝试直接执行
      console.log('📝 尝试替代方法...');
      
      // 尝试通过数据库连接直接执行
      const { data: result, error: directError } = await supabase
        .from('information_schema.tables')
        .select('*')
        .limit(1);
      
      if (directError) {
        throw new Error(`无法执行 SQL: ${error.message}`);
      }
      
      // 如果能连接到数据库，说明权限OK，但需要使用其他方法
      throw new Error(`需要 service role key 来执行 DDL 操作: ${error.message}`);
    }
    
    console.log('✅ SQL 执行成功');
    return { success: true, data };
    
  } catch (err) {
    console.error('❌ SQL 执行失败:', err.message);
    return { success: false, error: err.message };
  }
}

async function createCustomMoodsTableDirect() {
  console.log('🚀 开始创建 custom_moods 表...');
  
  // 定义创建表的 SQL
  const createTableSQL = `
-- 创建自定义心情表
CREATE TABLE IF NOT EXISTS custom_moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (LENGTH(name) > 0 AND LENGTH(name) <= 20),
  icon TEXT NOT NULL CHECK (LENGTH(icon) > 0 AND LENGTH(icon) <= 10),
  color TEXT NOT NULL CHECK (LENGTH(color) > 0 AND LENGTH(color) <= 20),
  description TEXT NOT NULL CHECK (LENGTH(description) > 0 AND LENGTH(description) <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- 确保每个用户的自定义心情名称唯一
  UNIQUE(user_id, name)
);`;

  const createIndexSQL = `
-- 为匿名用户（无 user_id）确保心情名称唯一
CREATE UNIQUE INDEX IF NOT EXISTS custom_moods_anonymous_name_unique 
ON custom_moods (name) 
WHERE user_id IS NULL;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_custom_moods_user_id ON custom_moods(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_moods_name ON custom_moods(name);`;

  const enableRLSSQL = `
-- 自定义心情表的 RLS 策略
ALTER TABLE custom_moods ENABLE ROW LEVEL SECURITY;`;

  const createPoliciesSQL = `
-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Users can view own custom moods" ON custom_moods;
DROP POLICY IF EXISTS "Users can insert own custom moods" ON custom_moods;
DROP POLICY IF EXISTS "Users can update own custom moods" ON custom_moods;
DROP POLICY IF EXISTS "Users can delete own custom moods" ON custom_moods;

-- 创建新策略
CREATE POLICY "Users can view own custom moods" ON custom_moods
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert own custom moods" ON custom_moods
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update own custom moods" ON custom_moods
    FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete own custom moods" ON custom_moods
    FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);`;

  // 尝试方法1：使用 PostgreSQL REST API
  try {
    console.log('🔨 方法1: 创建表...');
    await executeSQL(createTableSQL);
    
    console.log('🔨 方法2: 创建索引...');
    await executeSQL(createIndexSQL);
    
    console.log('🔨 方法3: 启用 RLS...');
    await executeSQL(enableRLSSQL);
    
    console.log('🔨 方法4: 创建策略...');
    await executeSQL(createPoliciesSQL);
    
    console.log('🎉 表创建完成！');
    
  } catch (error) {
    console.log('⚠️  直接执行SQL失败，尝试通过插入数据来创建表...');
    
    // 方法2：尝试直接插入数据，这样会触发表的自动创建（如果Supabase配置允许）
    try {
      const testData = {
        name: '测试心情',
        icon: '🎯',
        color: '#FF6B9D',
        description: '这是一个测试自定义心情'
      };
      
      const { data, error } = await supabase
        .from('custom_moods')
        .insert(testData)
        .select();
      
      if (error) {
        console.error('❌ 插入测试数据失败:', error.message);
        console.log('\n📋 请手动在 Supabase 控制台执行以下 SQL:');
        console.log('\n' + createTableSQL + '\n' + createIndexSQL + '\n' + enableRLSSQL + '\n' + createPoliciesSQL);
        return false;
      } else {
        console.log('✅ 通过数据插入成功创建了表！');
        
        // 删除测试数据
        if (data && data[0]) {
          await supabase
            .from('custom_moods')
            .delete()
            .eq('id', data[0].id);
          console.log('🧹 测试数据已清理');
        }
        
        return true;
      }
      
    } catch (insertError) {
      console.error('❌ 所有方法都失败了:', insertError.message);
      console.log('\n📋 请手动在 Supabase 控制台执行以下 SQL:');
      console.log('\n' + createTableSQL + '\n' + createIndexSQL + '\n' + enableRLSSQL + '\n' + createPoliciesSQL);
      return false;
    }
  }
  
  // 验证表是否创建成功
  try {
    console.log('🔍 验证表结构...');
    const { data, error } = await supabase
      .from('custom_moods')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ 表验证失败:', error.message);
      return false;
    } else {
      console.log('✅ custom_moods 表验证成功！');
      return true;
    }
  } catch (verifyError) {
    console.error('❌ 表验证过程出错:', verifyError.message);
    return false;
  }
}

// 执行创建
createCustomMoodsTableDirect()
  .then(success => {
    if (success) {
      console.log('\n🎊 所有操作完成！custom_moods 表已就绪。');
      console.log('💡 现在可以正常使用自定义心情功能了！');
    } else {
      console.log('\n❌ 操作失败，请查看上面的错误信息。');
    }
  })
  .catch(error => {
    console.error('\n💥 脚本执行出错:', error);
  });