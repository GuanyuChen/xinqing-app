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

async function removeMoodConstraint() {
  console.log('🔧 开始移除 mood_records 表的 mood_check 约束...\n');

  try {
    // 首先检查约束是否存在
    console.log('🔍 检查现有约束...');
    
    // 尝试插入一个测试记录来验证约束是否还存在
    const testRecord = {
      user_id: null,
      date: '2025-01-01',
      mood: 'custom_test_mood', // 这是一个不在原约束列表中的心情
      intensity: 3,
      diary: '测试约束'
    };

    console.log('🧪 测试当前约束状态...');
    const { data: testData, error: testError } = await supabase
      .from('mood_records')
      .insert(testRecord)
      .select();

    if (testError) {
      if (testError.code === '23514' && testError.message.includes('mood_records_mood_check')) {
        console.log('❌ 确认约束仍然存在，需要移除');
        console.log('\n📋 请在 Supabase 控制台的 SQL Editor 中执行以下 SQL：\n');
        console.log('='.repeat(60));
        console.log(`
-- 移除 mood_records 表的 mood_check 约束以支持自定义心情
ALTER TABLE mood_records DROP CONSTRAINT IF EXISTS mood_records_mood_check;

-- 验证约束已被移除
SELECT conname 
FROM pg_constraint 
WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = 'mood_records')
  AND conname LIKE '%mood_check%';
        `);
        console.log('='.repeat(60));
        console.log('\n💡 执行完成后，自定义心情就可以正常保存了！');
        return false;
      } else {
        console.log('❌ 其他错误:', testError.message);
        return false;
      }
    } else {
      console.log('✅ 约束已不存在或已正确配置！');
      console.log('📄 测试记录已插入:', testData);
      
      // 清理测试数据
      if (testData && testData[0] && testData[0].id) {
        console.log('🧹 清理测试数据...');
        const { error: deleteError } = await supabase
          .from('mood_records')
          .delete()
          .eq('id', testData[0].id);
        
        if (!deleteError) {
          console.log('✅ 测试数据已清理');
        } else {
          console.log('⚠️  清理测试数据失败:', deleteError.message);
        }
      }
      
      return true;
    }
  } catch (error) {
    console.error('❌ 操作失败:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 检查并移除心情约束限制...\n');
  
  const success = await removeMoodConstraint();
  
  if (success) {
    console.log('\n🎉 成功！现在可以保存任意自定义心情了！');
  } else {
    console.log('\n🛠️  需要手动执行 SQL 来移除约束。');
  }
}

main().catch(console.error);