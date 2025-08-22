const { createClient } = require('@supabase/supabase-js');

// 从环境变量读取配置
const supabaseUrl = 'https://qiqxttoczkaoanwfwbxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcXh0dG9jemthb2Fud2Z3YnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDUyNDgsImV4cCI6MjA3MTQyMTI0OH0.AedP8DVCr3j_-LB9B71Yj5sy6BaWPYc7jdzAonygIn4';

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanDatabase() {
  console.log('🧹 开始清理数据库表数据...\n');
  
  try {
    // 1. 查看当前数据
    console.log('📊 查看当前数据...');
    const { data: currentRecords, error: selectError } = await supabase
      .from('mood_records')
      .select('id, date, mood, diary, photo_url, audio_url, created_at')
      .order('created_at', { ascending: false });

    if (selectError) {
      console.error('查询数据失败:', selectError);
      return;
    }

    if (!currentRecords || currentRecords.length === 0) {
      console.log('✨ 表中没有数据，无需清理');
      return;
    }

    console.log(`📁 找到 ${currentRecords.length} 条记录:`);
    currentRecords.forEach((record, index) => {
      console.log(`  ${index + 1}. ${record.date} - ${record.mood} (ID: ${record.id.slice(0, 8)}...)`);
      if (record.diary) {
        const shortDiary = record.diary.length > 50 ? record.diary.slice(0, 50) + '...' : record.diary;
        console.log(`     日记: "${shortDiary}"`);
      }
      if (record.photo_url) console.log(`     照片: ${record.photo_url}`);
      if (record.audio_url) console.log(`     音频: ${record.audio_url}`);
      console.log(`     创建时间: ${record.created_at}`);
    });

    console.log('\n⚠️  即将删除所有数据，这个操作不可逆！');
    
    // 2. 删除所有记录
    console.log('🗑️  正在删除所有记录...');
    const { error: deleteError, count } = await supabase
      .from('mood_records')
      .delete()
      .not('id', 'is', null);

    if (deleteError) {
      console.error('删除数据失败:', deleteError);
      return;
    }

    console.log(`✅ 成功删除了所有记录`);

    // 3. 验证清理结果
    console.log('🔍 验证清理结果...');
    const { data: remainingRecords, error: verifyError } = await supabase
      .from('mood_records')
      .select('count');

    if (verifyError) {
      console.error('验证失败:', verifyError);
      return;
    }

    const { data: finalCheck } = await supabase
      .from('mood_records')
      .select('*')
      .limit(10);

    if (!finalCheck || finalCheck.length === 0) {
      console.log('✅ 验证通过：数据表现在是空的');
    } else {
      console.log(`⚠️  仍有 ${finalCheck.length} 条记录未删除`);
    }

  } catch (error) {
    console.error('清理过程中发生错误:', error);
  }
}

async function cleanAllData() {
  console.log('🧹 开始全面清理 Supabase 数据...\n');
  
  // 1. 清理存储桶（如果存在）
  console.log('📦 检查并清理存储桶...');
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (!error && buckets && buckets.length > 0) {
      console.log(`找到 ${buckets.length} 个存储桶:`);
      
      for (const bucket of buckets) {
        console.log(`  清理存储桶: ${bucket.name}`);
        
        // 列出所有文件
        const { data: files, error: listError } = await supabase.storage
          .from(bucket.name)
          .list('', { limit: 1000 });

        if (!listError && files && files.length > 0) {
          const filePaths = files
            .filter(f => f.name && f.name !== '.emptyFolderPlaceholder')
            .map(f => f.name);
          
          if (filePaths.length > 0) {
            console.log(`    删除 ${filePaths.length} 个文件...`);
            const { error: removeError } = await supabase.storage
              .from(bucket.name)
              .remove(filePaths);
            
            if (removeError) {
              console.log(`    删除文件失败:`, removeError);
            } else {
              console.log(`    ✅ 成功删除文件`);
            }
          }
        }
        
        // 删除存储桶
        const { error: deleteBucketError } = await supabase.storage.deleteBucket(bucket.name);
        if (deleteBucketError) {
          console.log(`    删除存储桶失败:`, deleteBucketError);
        } else {
          console.log(`    ✅ 成功删除存储桶`);
        }
      }
    } else {
      console.log('  没有找到存储桶');
    }
  } catch (error) {
    console.log('存储桶清理失败:', error.message);
  }

  console.log('\n' + '─'.repeat(50) + '\n');

  // 2. 清理数据库表
  await cleanDatabase();
  
  console.log('\n🎉 全面清理完成！');
}

// 运行清理脚本
if (require.main === module) {
  cleanAllData().then(() => {
    console.log('\n🏁 脚本执行完成');
    process.exit(0);
  }).catch(error => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { cleanDatabase, cleanAllData };