import { supabase } from './supabaseStorage';
import { CustomMood } from '../types/mood';

export class CustomMoodStorage {
  private static tableName = 'custom_moods';
  private static localStorageKey = 'custom_moods';

  // 本地存储方法
  private static getLocalStorage(): CustomMood[] {
    try {
      const data = localStorage.getItem(this.localStorageKey);
      if (data) {
        return JSON.parse(data).map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt)
        }));
      }
      return [];
    } catch (error) {
      console.error('读取本地自定义心情失败:', error);
      return [];
    }
  }

  private static setLocalStorage(moods: CustomMood[]): void {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(moods));
    } catch (error) {
      console.error('保存本地自定义心情失败:', error);
    }
  }

  static async getAll(userId?: string): Promise<CustomMood[]> {
    try {
      // 优先尝试从 Supabase 获取
      let query = supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Supabase 获取自定义心情失败，使用本地存储:', error.message);
        return this.getLocalStorage();
      }

      console.log('✅ 从 Supabase 成功获取自定义心情:', data.length, '条');
      return data.map(item => ({
        ...item,
        createdAt: new Date(item.created_at),
        userId: item.user_id
      }));
    } catch (error) {
      console.warn('获取自定义心情失败，使用本地存储:', error);
      return this.getLocalStorage();
    }
  }

  static async save(customMood: Omit<CustomMood, 'id' | 'createdAt'>, userId?: string): Promise<CustomMood | null> {
    try {
      // 优先尝试保存到 Supabase
      console.log('💾 正在保存自定义心情到 Supabase:', customMood.name);
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert({
          user_id: userId || null,
          name: customMood.name,
          icon: customMood.icon,
          color: customMood.color,
          description: customMood.description
        })
        .select()
        .single();

      if (error) {
        console.warn('Supabase 保存失败，使用本地存储:', error.message);
        
        // 降级到本地存储
        const newMood: CustomMood = {
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ...customMood,
          createdAt: new Date(),
          userId: userId
        };
        
        const localMoods = this.getLocalStorage();
        
        // 检查名称是否重复
        if (localMoods.some(m => m.name === customMood.name)) {
          console.error('自定义心情名称已存在');
          return null;
        }
        
        localMoods.unshift(newMood);
        this.setLocalStorage(localMoods);
        return newMood;
      }

      console.log('✅ 成功保存到 Supabase:', data.name);
      return {
        ...data,
        createdAt: new Date(data.created_at),
        userId: data.user_id
      };
    } catch (error) {
      console.warn('保存自定义心情失败，使用本地存储:', error);
      
      // 降级到本地存储
      const newMood: CustomMood = {
        id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...customMood,
        createdAt: new Date(),
        userId: userId
      };
      
      const localMoods = this.getLocalStorage();
      
      // 检查名称是否重复
      if (localMoods.some(m => m.name === customMood.name)) {
        console.error('自定义心情名称已存在');
        return null;
      }
      
      localMoods.unshift(newMood);
      this.setLocalStorage(localMoods);
      return newMood;
    }
  }

  static async delete(id: string): Promise<boolean> {
    try {
      // 如果是本地 ID，直接从本地存储删除
      if (id.startsWith('local_')) {
        const localMoods = this.getLocalStorage();
        const filteredMoods = localMoods.filter(m => m.id !== id);
        this.setLocalStorage(filteredMoods);
        return true;
      }

      // 尝试从 Supabase 删除
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase 删除失败，尝试本地存储:', error);
        const localMoods = this.getLocalStorage();
        const filteredMoods = localMoods.filter(m => m.id !== id);
        this.setLocalStorage(filteredMoods);
        return filteredMoods.length < localMoods.length;
      }

      return true;
    } catch (error) {
      console.error('删除自定义心情失败:', error);
      return false;
    }
  }

  static async update(id: string, updates: Partial<Pick<CustomMood, 'name' | 'icon' | 'color' | 'description'>>): Promise<CustomMood | null> {
    try {
      // 如果是本地 ID，从本地存储更新
      if (id.startsWith('local_')) {
        const localMoods = this.getLocalStorage();
        const index = localMoods.findIndex(m => m.id === id);
        if (index !== -1) {
          localMoods[index] = { ...localMoods[index], ...updates };
          this.setLocalStorage(localMoods);
          return localMoods[index];
        }
        return null;
      }

      // 尝试在 Supabase 中更新
      const { data, error } = await supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.warn('Supabase 更新失败:', error);
        return null;
      }

      return {
        ...data,
        createdAt: new Date(data.created_at),
        userId: data.user_id
      };
    } catch (error) {
      console.error('更新自定义心情失败:', error);
      return null;
    }
  }

  static async getByName(name: string, userId?: string): Promise<CustomMood | null> {
    try {
      // 首先尝试从 Supabase 获取
      let query = supabase
        .from(this.tableName)
        .select('*')
        .eq('name', name);

      if (userId) {
        query = query.eq('user_id', userId);
      } else {
        query = query.is('user_id', null);
      }

      const { data, error } = await query.single();

      if (error) {
        // 从本地存储查找
        const localMoods = this.getLocalStorage();
        return localMoods.find(m => m.name === name) || null;
      }

      return {
        ...data,
        createdAt: new Date(data.created_at),
        userId: data.user_id
      };
    } catch (error) {
      // 从本地存储查找
      const localMoods = this.getLocalStorage();
      return localMoods.find(m => m.name === name) || null;
    }
  }
}

export default CustomMoodStorage;