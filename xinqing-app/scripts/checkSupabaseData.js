const { createClient } = require('@supabase/supabase-js');

// 从环境变量读取配置
const supabaseUrl = 'https://qiqxttoczkaoanwfwbxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcXh0dG9jemthb2Fud2Z3YnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDUyNDgsImV4cCI6MjA3MTQyMTI0OH0.AedP8DVCr3j_-LB9B71Yj5sy6BaWPYc7jdzAonygIn4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllBuckets() {
  console.log('🗂️  正在查询所有存储桶...');
  
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('获取存储桶列表失败:', error);
      return;
    }

    if (!buckets || buckets.length === 0) {
      console.log('📭 没有找到任何存储桶');
      return;
    }

    console.log(`📦 找到 ${buckets.length} 个存储桶:`);
    buckets.forEach((bucket, index) => {
      console.log(`  ${index + 1}. ${bucket.name} (${bucket.public ? '公开' : '私有'})`);
      console.log(`     创建时间: ${bucket.created_at}`);
      console.log(`     更新时间: ${bucket.updated_at}`);
      if (bucket.file_size_limit) {
        console.log(`     文件大小限制: ${(bucket.file_size_limit / 1024 / 1024).toFixed(1)} MB`);
      }
      console.log('');
    });

    // 对每个桶检查文件数量
    for (const bucket of buckets) {
      console.log(`🔍 检查存储桶 "${bucket.name}" 中的文件...`);
      
      const { data: files, error: listError } = await supabase.storage
        .from(bucket.name)
        .list('', { limit: 10 });

      if (listError) {
        console.log(`   ❌ 无法访问存储桶: ${listError.message}`);
      } else {
        console.log(`   📁 包含 ${files?.length || 0} 个项目`);
        if (files && files.length > 0) {
          files.forEach(file => {
            if (file.name) {
              const size = file.metadata?.size ? `(${(file.metadata.size / 1024).toFixed(1)} KB)` : '';
              console.log(`     - ${file.name} ${size}`);
            }
          });
        }
      }
      console.log('');
    }

  } catch (error) {
    console.error('查询存储桶时发生错误:', error);
  }
}

async function checkDatabase() {
  console.log('💾 正在检查数据库表...');
  
  try {
    // 检查心情记录表
    const { data: records, error } = await supabase
      .from('mood_records')
      .select('id, date, photo_url, audio_url')
      .limit(10);

    if (error) {
      console.log('❌ 无法访问 mood_records 表:', error.message);
    } else {
      console.log(`📊 mood_records 表包含 ${records?.length || 0} 条记录`);
      
      if (records && records.length > 0) {
        const withMedia = records.filter(r => r.photo_url || r.audio_url);
        console.log(`   其中 ${withMedia.length} 条记录包含媒体文件`);
        
        withMedia.forEach(record => {
          console.log(`   记录 ${record.id} (${record.date}):`);
          if (record.photo_url) console.log(`     照片: ${record.photo_url}`);
          if (record.audio_url) console.log(`     音频: ${record.audio_url}`);
        });
      }
    }
  } catch (error) {
    console.error('检查数据库时发生错误:', error);
  }
}

async function cleanAll() {
  console.log('🧹 开始全面清理 Supabase 数据...\n');
  
  await listAllBuckets();
  console.log('─'.repeat(50));
  await checkDatabase();
  
  console.log('\n🏁 检查完成');
}

// 运行检查脚本
if (require.main === module) {
  cleanAll().then(() => {
    process.exit(0);
  }).catch(error => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
}