import { supabase } from './supabaseStorage';
import { CustomMood } from '../types/mood';

// 用户认证版本的自定义心情存储服务
export class UserCustomMoodStorage {
  private static tableName = 'user_custom_moods';

  // 获取用户的所有自定义心情
  static async getAll(userId: string): Promise<CustomMood[]> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(item => ({
        ...item,
        createdAt: new Date(item.created_at),
        userId: item.user_id
      }));
    } catch (error) {
      console.error('获取用户自定义心情失败:', error);
      throw new Error('获取数据失败，请检查网络连接');
    }
  }

  // 保存用户自定义心情
  static async save(
    customMood: Omit<CustomMood, 'id' | 'createdAt'>, 
    userId: string
  ): Promise<CustomMood> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          user_id: userId,
          name: customMood.name,
          icon: customMood.icon,
          color: customMood.color,
          description: customMood.description
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        ...data,
        createdAt: new Date(data.created_at),
        userId: data.user_id
      };
    } catch (error) {
      console.error('保存用户自定义心情失败:', error);
      throw new Error('保存失败，请检查网络连接');
    }
  }

  // 删除用户自定义心情
  static async delete(id: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('删除用户自定义心情失败:', error);
      return false;
    }
  }

  // 更新用户自定义心情
  static async update(
    id: string, 
    updates: Partial<Pick<CustomMood, 'name' | 'icon' | 'color' | 'description'>>,
    userId: string
  ): Promise<CustomMood | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        ...data,
        createdAt: new Date(data.created_at),
        userId: data.user_id
      };
    } catch (error) {
      console.error('更新用户自定义心情失败:', error);
      throw new Error('更新失败，请检查网络连接');
    }
  }

  // 根据名称获取用户自定义心情
  static async getByName(name: string, userId: string): Promise<CustomMood | null> {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .eq('name', name)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // 没有找到记录
          return null;
        }
        throw error;
      }

      return {
        ...data,
        createdAt: new Date(data.created_at),
        userId: data.user_id
      };
    } catch (error) {
      console.error('获取用户自定义心情失败:', error);
      return null;
    }
  }
}

export default UserCustomMoodStorage;