const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// 从环境变量读取 Supabase 配置
require('dotenv').config();

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 请确保 .env 文件中配置了 REACT_APP_SUPABASE_URL 和 REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySchema() {
  console.log('🔧 开始应用数据库 Schema...');
  
  try {
    // 读取 schema 文件
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    // 分割 SQL 语句（简单的分割，基于分号和换行）
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 发现 ${statements.length} 个 SQL 语句`);
    
    // 执行每个语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`⏳ 执行语句 ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error && !error.message.includes('already exists')) {
          console.warn(`⚠️  语句 ${i + 1} 警告:`, error.message);
        } else if (!error) {
          console.log(`✅ 语句 ${i + 1} 执行成功`);
        }
      } catch (err) {
        console.warn(`⚠️  语句 ${i + 1} 跳过:`, err.message);
      }
    }
    
    console.log('🎉 Schema 应用完成！');
    
    // 验证表是否创建成功
    console.log('🔍 验证表结构...');
    
    const { data: customMoodsTable, error: customMoodsError } = await supabase
      .from('custom_moods')
      .select('*')
      .limit(1);
    
    if (customMoodsError) {
      console.error('❌ custom_moods 表验证失败:', customMoodsError.message);
    } else {
      console.log('✅ custom_moods 表验证成功');
    }
    
  } catch (error) {
    console.error('❌ 应用 Schema 失败:', error);
  }
}

applySchema();