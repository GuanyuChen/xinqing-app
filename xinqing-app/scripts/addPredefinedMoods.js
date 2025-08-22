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

// 预置的8个心情数据
const predefinedMoods = [
  {
    name: 'happy',
    icon: '😊',
    color: '#FFD93D',
    description: '感到快乐和满足',
    is_predefined: true
  },
  {
    name: 'sad', 
    icon: '😢',
    color: '#74B9FF',
    description: '感到悲伤或沮丧',
    is_predefined: true
  },
  {
    name: 'anxious',
    icon: '😰', 
    color: '#FD79A8',
    description: '感到紧张或担心',
    is_predefined: true
  },
  {
    name: 'calm',
    icon: '😌',
    color: '#6C5CE7',
    description: '感到平静和放松', 
    is_predefined: true
  },
  {
    name: 'angry',
    icon: '😡',
    color: '#E84393',
    description: '感到愤怒或烦躁',
    is_predefined: true
  },
  {
    name: 'excited',
    icon: '🤩',
    color: '#00B894',
    description: '感到兴奋或激动',
    is_predefined: true
  },
  {
    name: 'tired',
    icon: '😴',
    color: '#636E72',
    description: '感到疲惫或倦怠',
    is_predefined: true
  },
  {
    name: 'peaceful',
    icon: '🧘‍♀️',
    color: '#00CEC9',
    description: '感到内心宁静',
    is_predefined: true
  }
];

async function addPredefinedMoods() {
  console.log('🚀 开始添加预置心情到 Supabase...\n');

  // 首先检查是否已经存在预置心情
  try {
    const { data: existingMoods, error: checkError } = await supabase
      .from('custom_moods')
      .select('name')
      .is('user_id', null)
      .in('name', predefinedMoods.map(m => m.name));

    if (checkError) {
      console.error('❌ 检查现有心情失败:', checkError.message);
      return;
    }

    const existingNames = existingMoods.map(m => m.name);
    const newMoods = predefinedMoods.filter(m => !existingNames.includes(m.name));

    if (newMoods.length === 0) {
      console.log('✅ 所有预置心情已存在，无需添加');
      
      // 显示现有的预置心情
      const { data: allPredefined } = await supabase
        .from('custom_moods')
        .select('*')
        .is('user_id', null)
        .order('name');
      
      console.log('\n📊 当前数据库中的预置心情:');
      allPredefined.forEach((mood, index) => {
        console.log(`${index + 1}. ${mood.icon} ${mood.name} - ${mood.description}`);
      });
      
      return;
    }

    console.log(`📝 需要添加 ${newMoods.length} 个新的预置心情:`);
    newMoods.forEach(mood => {
      console.log(`   ${mood.icon} ${mood.name}`);
    });

    // 添加新的预置心情
    const { data, error } = await supabase
      .from('custom_moods')
      .insert(
        newMoods.map(mood => ({
          user_id: null, // 预置心情属于系统，不属于特定用户
          name: mood.name,
          icon: mood.icon,
          color: mood.color,
          description: mood.description
        }))
      )
      .select();

    if (error) {
      console.error('❌ 添加预置心情失败:', error.message);
      return;
    }

    console.log(`✅ 成功添加 ${data.length} 个预置心情！`);
    
    // 显示所有预置心情
    const { data: allPredefined } = await supabase
      .from('custom_moods')
      .select('*')
      .is('user_id', null)
      .order('name');
    
    console.log('\n🎉 数据库中现有的所有预置心情:');
    allPredefined.forEach((mood, index) => {
      console.log(`${index + 1}. ${mood.icon} ${mood.name} - ${mood.description}`);
    });

  } catch (error) {
    console.error('❌ 操作失败:', error.message);
  }
}

async function testMoodRetrieval() {
  console.log('\n🧪 测试心情检索功能...');
  
  try {
    // 获取所有心情（预置 + 自定义）
    const { data: allMoods, error } = await supabase
      .from('custom_moods')
      .select('*')
      .is('user_id', null) // 只获取系统心情和匿名用户的自定义心情
      .order('created_at', { ascending: true }); // 预置心情会最先显示
    
    if (error) {
      console.error('❌ 获取心情失败:', error.message);
      return;
    }
    
    console.log(`✅ 成功获取 ${allMoods.length} 个心情:`);
    allMoods.forEach((mood, index) => {
      console.log(`${index + 1}. ${mood.icon} ${mood.name} (${mood.color})`);
    });
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

async function main() {
  await addPredefinedMoods();
  await testMoodRetrieval();
  
  console.log('\n🎊 预置心情初始化完成！');
  console.log('💡 现在应用会从 Supabase 中读取所有心情，包括预置心情和用户自定义心情。');
}

main().catch(console.error);