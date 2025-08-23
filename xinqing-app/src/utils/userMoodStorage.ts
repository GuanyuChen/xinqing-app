import { supabase } from './supabaseStorage';
import { MoodRecord, MoodType } from '../types/mood';

// 用户认证版本的数据库表结构定义
export interface UserDatabaseMoodRecord {
  id: string;
  user_id: string;
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

// 用户认证版本的心情存储服务
class UserMoodStorage {
  private static readonly TABLE_NAME = 'user_mood_records';
  private static readonly BUCKET_NAME = 'user-mood-media';

  // 获取当前认证用户
  private static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('用户未认证');
    }
    return user;
  }

  // 获取当前用户的所有心情记录
  static async getAll(userId: string): Promise<MoodRecord[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      return (data || []).map(this.transformFromDatabase);
    } catch (error) {
      console.error('获取用户心情记录失败:', error);
      throw new Error('获取数据失败，请检查网络连接');
    }
  }

  // 根据日期获取心情记录
  static async getByDate(date: string, userId: string): Promise<MoodRecord | null> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? this.transformFromDatabase(data) : null;
    } catch (error) {
      console.error('获取指定日期记录失败:', error);
      return null;
    }
  }

  // 根据日期范围获取心情记录
  static async getByDateRange(
    startDate: string, 
    endDate: string, 
    userId: string
  ): Promise<MoodRecord[]> {
    try {
      const { data, error } = await supabase
        .from(this.TABLE_NAME)
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      if (error) {
        throw error;
      }

      return (data || []).map(this.transformFromDatabase);
    } catch (error) {
      console.error('获取日期范围记录失败:', error);
      throw new Error('获取数据失败，请检查网络连接');
    }
  }

  // 创建或更新心情记录
  static async upsert(
    record: Omit<MoodRecord, 'id' | 'createdAt' | 'updatedAt'>, 
    userId: string
  ): Promise<MoodRecord> {
    try {
      const existingRecord = await this.getByDate(record.date, userId);
      
      if (existingRecord) {
        // 更新现有记录
        const dbRecord = this.transformToDatabase(record, userId);
        
        const { data, error } = await supabase
          .from(this.TABLE_NAME)
          .update(dbRecord)
          .eq('id', existingRecord.id)
          .eq('user_id', userId)
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
      console.error('保存用户心情记录失败:', error);
      throw new Error('保存失败，请检查网络连接');
    }
  }

  // 删除心情记录
  static async delete(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.TABLE_NAME)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('删除用户心情记录失败:', error);
      return false;
    }
  }

  // 上传媒体文件
  static async uploadMedia(
    file: File, 
    type: 'photo' | 'audio',
    userId: string
  ): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${type}/${Date.now()}.${fileExt}`;

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
      console.error('上传用户媒体文件失败:', error);
      throw new Error('文件上传失败，请检查网络连接');
    }
  }

  // 删除媒体文件
  static async deleteMedia(url: string): Promise<boolean> {
    try {
      const path = url.split(`/${this.BUCKET_NAME}/`)[1];
      if (!path) return false;

      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      return !error;
    } catch (error) {
      console.error('删除用户媒体文件失败:', error);
      return false;
    }
  }

  // 数据转换方法
  private static transformFromDatabase(dbRecord: UserDatabaseMoodRecord): MoodRecord {
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
    userId: string
  ): Omit<UserDatabaseMoodRecord, 'id' | 'created_at'> {
    return {
      user_id: userId,
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

export default UserMoodStorage;