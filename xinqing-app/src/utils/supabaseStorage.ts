import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { MoodRecord, MoodType } from '../types/mood';

// Supabase 配置
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);

// 数据库表结构定义
export interface DatabaseMoodRecord {
  id: string;
  user_id?: string | null;
  date: string;
  mood: MoodType;
  intensity: number;
  diary: string;
  photo_url?: string;
  audio_url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// 初始化标记，确保只执行一次
let isInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

// Supabase 存储服务类
class SupabaseMoodStorage {
  private static readonly TABLE_NAME = 'mood_records';
  private static readonly BUCKET_NAME = 'mood-media';

  // 统一的初始化方法，确保只执行一次
  static async initialize(): Promise<boolean> {
    if (isInitialized) {
      return true;
    }

    if (initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = this._doInitialize();
    return initializationPromise;
  }

  private static async _doInitialize(): Promise<boolean> {
    try {
      // 1. 检查数据库连接
      const connectionOk = await this._checkConnection();
      if (!connectionOk) {
        console.error('Supabase 数据库连接失败');
        return false;
      }

      // 2. 确保存储桶存在
      const bucketOk = await this._ensureBucketExists();
      if (!bucketOk) {
        console.warn('存储桶创建失败，文件上传功能可能不可用');
        // 但不阻止其他功能使用
      }

      isInitialized = true;
      console.log('✅ Supabase 初始化完成');
      return true;
    } catch (error) {
      console.error('Supabase 初始化失败:', error);
      return false;
    }
  }

  // 检查数据库连接
  private static async _checkConnection(): Promise<boolean> {
    try {
      const { error } = await supabase.from(this.TABLE_NAME).select('count').limit(1);
      return !error;
    } catch (error) {
      console.error('数据库连接检查失败:', error);
      return false;
    }
  }

  // 确保存储桶存在
  private static async _ensureBucketExists(): Promise<boolean> {
    try {
      // 检查存储桶是否存在
      const { data: buckets, error: listError } = await supabase.storage.listBuckets();
      
      if (listError) {
        console.error('获取存储桶列表失败:', listError);
        return false;
      }

      const bucketExists = buckets?.some(bucket => bucket.name === this.BUCKET_NAME);
      
      if (bucketExists) {
        return true;
      }

      // 创建存储桶
      const { error: createError } = await supabase.storage.createBucket(this.BUCKET_NAME, {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: [
          'image/jpeg', 'image/png', 'image/gif', 'image/webp',
          'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp4'
        ]
      });

      if (createError) {
        // 如果是因为已存在而失败，不算错误
        if (createError.message.includes('already exists')) {
          return true;
        }
        console.error('创建存储桶失败:', createError);
        return false;
      }

      return true;
    } catch (error) {
      console.error('存储桶初始化失败:', error);
      return false;
    }
  }

  // 公共方法都先调用初始化
  static async getAll(userId?: string): Promise<MoodRecord[]> {
    await this.initialize();
    
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*')
        .order('date', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        // 匿名用户，查询 user_id 为 null 的记录
        query = query.is('user_id', null);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.transformFromDatabase);
    } catch (error) {
      console.error('获取心情记录失败:', error);
      throw new Error('获取数据失败，请检查网络连接');
    }
  }

  static async getByDate(date: string, userId?: string): Promise<MoodRecord | null> {
    await this.initialize();
    
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('date', date);

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        throw error;
      }

      return data ? this.transformFromDatabase(data) : null;
    } catch (error) {
      console.error('获取指定日期记录失败:', error);
      return null;
    }
  }

  static async getByDateRange(
    startDate: string, 
    endDate: string, 
    userId?: string
  ): Promise<MoodRecord[]> {
    await this.initialize();
    
    try {
      let query = supabase
        .from(this.TABLE_NAME)
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.transformFromDatabase);
    } catch (error) {
      console.error('获取日期范围记录失败:', error);
      throw new Error('获取数据失败，请检查网络连接');
    }
  }

  static async upsert(
    record: Omit<MoodRecord, 'id' | 'createdAt' | 'updatedAt'>, 
    userId?: string
  ): Promise<MoodRecord> {
    await this.initialize();
    
    try {
      const existingRecord = await this.getByDate(record.date, userId);
      
      if (existingRecord) {
        // 更新现有记录
        const dbRecord = this.transformToDatabase(record, userId);
        
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .update(dbRecord)
          .eq('id', existingRecord.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return this.transformFromDatabase(data);
      } else {
        // 创建新记录
        const dbRecord = this.transformToDatabase(record, userId);
        
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .insert(dbRecord)
          .select()
          .single();

        if (error) {
          throw error;
        }

        return this.transformFromDatabase(data);
      }
    } catch (error) {
      console.error('保存心情记录失败:', error);
      throw new Error('保存失败，请检查网络连接');
    }
  }

  static async delete(id: string): Promise<boolean> {
    await this.initialize();
    
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('删除心情记录失败:', error);
      return false;
    }
  }

  static async uploadMedia(
    file: File, 
    type: 'photo' | 'audio',
    userId?: string
  ): Promise<string> {
    await this.initialize();
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId || 'anonymous'}/${type}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('上传媒体文件失败:', error);
      throw new Error('文件上传失败，请检查网络连接');
    }
  }

  static async deleteMedia(url: string): Promise<boolean> {
    try {
      const path = url.split(`/${this.BUCKET_NAME}/`)[1];
      if (!path) return false;

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      return !error;
    } catch (error) {
      console.error('删除媒体文件失败:', error);
      return false;
    }
  }

  // 数据转换方法
  private static transformFromDatabase(dbRecord: DatabaseMoodRecord): MoodRecord {
    return {
      id: dbRecord.id,
      date: dbRecord.date,
      mood: dbRecord.mood,
      intensity: dbRecord.intensity,
      diary: dbRecord.diary,
      photo: dbRecord.photo_url,
      audio: dbRecord.audio_url,
      tags: dbRecord.tags || [],
      createdAt: new Date(dbRecord.created_at),
      updatedAt: new Date(dbRecord.updated_at),
    };
  }

  private static transformToDatabase(
    record: Omit<MoodRecord, 'id' | 'createdAt' | 'updatedAt'>, 
    userId?: string
  ): Omit<DatabaseMoodRecord, 'id' | 'created_at'> {
    return {
      user_id: userId || null,
      date: record.date,
      mood: record.mood,
      intensity: record.intensity,
      diary: record.diary,
      photo_url: record.photo,
      audio_url: record.audio,
      tags: record.tags || [],
      updated_at: new Date().toISOString(),
    };
  }
}

export default SupabaseMoodStorage;