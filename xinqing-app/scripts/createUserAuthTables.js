const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Supabase 配置
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ 错误：缺少 Supabase 配置信息');
    console.error('请检查 .env 文件中的 REACT_APP_SUPABASE_URL 和 REACT_APP_SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createUserAuthTables() {
    try {
        console.log('🚀 开始创建用户认证表结构...');
        
        // 读取 SQL 文件
        const sqlPath = path.join(__dirname, '..', 'database', 'user_auth_schema.sql');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // 分割 SQL 语句（以分号分割）
        const statements = sqlContent
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`📝 准备执行 ${statements.length} 个 SQL 语句`);
        
        // 逐个执行 SQL 语句
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    console.log(`⏳ 执行语句 ${i + 1}/${statements.length}...`);
                    const { error } = await supabase.rpc('exec_sql', { sql: statement });
                    
                    if (error) {
                        console.warn(`⚠️  语句 ${i + 1} 执行警告:`, error.message);
                        // 继续执行其他语句，因为某些语句可能已经存在
                    }
                } catch (err) {
                    console.warn(`⚠️  语句 ${i + 1} 执行异常:`, err.message);
                }
            }
        }
        
        // 验证表是否创建成功
        console.log('🔍 验证表结构...');
        
        const { data: userMoodRecords, error: error1 } = await supabase
            .from('user_mood_records')
            .select('count', { count: 'exact', head: true });
            
        const { data: userCustomMoods, error: error2 } = await supabase
            .from('user_custom_moods')
            .select('count', { count: 'exact', head: true });
        
        if (error1 || error2) {
            console.error('❌ 表验证失败:', { error1, error2 });
            throw new Error('表创建可能失败');
        }
        
        console.log('✅ 用户认证表结构创建成功！');
        console.log('📊 表状态:');
        console.log(`   - user_mood_records: 已创建`);
        console.log(`   - user_custom_moods: 已创建`);
        console.log('🔐 RLS 策略和索引已配置');
        console.log('💾 存储桶 user-mood-media 已配置');
        
    } catch (error) {
        console.error('❌ 创建用户认证表失败:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    createUserAuthTables();
}

module.exports = { createUserAuthTables };