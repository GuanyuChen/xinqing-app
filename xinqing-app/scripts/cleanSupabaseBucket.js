const { createClient } = require('@supabase/supabase-js');

// 从环境变量读取配置
const supabaseUrl = 'https://qiqxttoczkaoanwfwbxn.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpcXh0dG9jemthb2Fud2Z3YnhuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDUyNDgsImV4cCI6MjA3MTQyMTI0OH0.AedP8DVCr3j_-LB9B71Yj5sy6BaWPYc7jdzAonygIn4';

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'mood-media';

async function listAllFiles(bucketName, folder = '') {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folder, {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) {
      console.error(`列出文件失败 (${folder}):`, error);
      return [];
    }

    const allFiles = [];
    
    for (const item of data || []) {
      if (item.name && !item.id) {
        // 这是一个文件夹，递归列出其中的文件
        const subFiles = await listAllFiles(bucketName, folder ? `${folder}/${item.name}` : item.name);
        allFiles.push(...subFiles);
      } else if (item.name) {
        // 这是一个文件
        const fullPath = folder ? `${folder}/${item.name}` : item.name;
        allFiles.push({
          name: item.name,
          path: fullPath,
          size: item.metadata?.size,
          created_at: item.created_at,
          updated_at: item.updated_at
        });
      }
    }

    return allFiles;
  } catch (error) {
    console.error('列出文件时发生错误:', error);
    return [];
  }
}

async function deleteFiles(bucketName, filePaths) {
  if (filePaths.length === 0) {
    console.log('没有文件需要删除');
    return true;
  }

  try {
    console.log(`正在删除 ${filePaths.length} 个文件...`);
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .remove(filePaths);

    if (error) {
      console.error('删除文件失败:', error);
      return false;
    }

    console.log(`✅ 成功删除 ${data?.length || 0} 个文件`);
    return true;
  } catch (error) {
    console.error('删除文件时发生错误:', error);
    return false;
  }
}

async function cleanBucket() {
  console.log(`🧹 开始清理 Supabase 存储桶: ${BUCKET_NAME}`);
  
  try {
    // 1. 检查桶是否存在
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('获取存储桶列表失败:', listError);
      return;
    }

    const bucket = buckets?.find(b => b.name === BUCKET_NAME);
    if (!bucket) {
      console.log(`❌ 存储桶 "${BUCKET_NAME}" 不存在`);
      return;
    }

    console.log(`✅ 找到存储桶: ${BUCKET_NAME}`);

    // 2. 列出所有文件
    console.log('📋 正在列出所有文件...');
    const files = await listAllFiles(BUCKET_NAME);
    
    if (files.length === 0) {
      console.log('✨ 存储桶已经是空的!');
      return;
    }

    console.log(`📁 找到 ${files.length} 个文件:`);
    files.forEach((file, index) => {
      const size = file.size ? `(${(file.size / 1024).toFixed(1)} KB)` : '';
      console.log(`  ${index + 1}. ${file.path} ${size}`);
    });

    // 3. 删除所有文件
    const filePaths = files.map(f => f.path);
    const success = await deleteFiles(BUCKET_NAME, filePaths);

    if (success) {
      console.log('🎉 存储桶清理完成!');
    } else {
      console.log('❌ 清理过程中出现错误');
    }

    // 4. 验证清理结果
    console.log('🔍 验证清理结果...');
    const remainingFiles = await listAllFiles(BUCKET_NAME);
    
    if (remainingFiles.length === 0) {
      console.log('✅ 验证通过：存储桶现在是空的');
    } else {
      console.log(`⚠️  仍有 ${remainingFiles.length} 个文件未删除`);
      remainingFiles.forEach(file => {
        console.log(`  - ${file.path}`);
      });
    }

  } catch (error) {
    console.error('清理过程中发生错误:', error);
  }
}

// 运行清理脚本
if (require.main === module) {
  cleanBucket().then(() => {
    console.log('🏁 脚本执行完成');
    process.exit(0);
  }).catch(error => {
    console.error('❌ 脚本执行失败:', error);
    process.exit(1);
  });
}

module.exports = { cleanBucket, listAllFiles, deleteFiles };