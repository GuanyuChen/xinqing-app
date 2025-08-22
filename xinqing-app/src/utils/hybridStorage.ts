import SupabaseMoodStorage from './supabaseStorage';
import { MoodRecord, MoodStats, WordFrequency } from '../types/mood';

// 统一的存储接口
export interface IMoodStorage {
  getAll(): Promise<MoodRecord[]>;
  getByDate(date: string): Promise<MoodRecord | null>;
  getByDateRange(startDate: string, endDate: string): Promise<MoodRecord[]>;
  save(record: Omit<MoodRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MoodRecord>;
  delete(id: string): Promise<boolean>;
  getStats(): Promise<MoodStats>;
  getWordFrequency(): Promise<WordFrequency[]>;
  export(): Promise<string>;
  import(data: string): Promise<boolean>;
  clear(): Promise<void>;
}

class HybridMoodStorage implements IMoodStorage {
  private userId?: string;

  constructor(userId?: string) {
    this.userId = userId;
  }

  async getAll(): Promise<MoodRecord[]> {
    return await SupabaseMoodStorage.getAll(this.userId);
  }

  async getByDate(date: string): Promise<MoodRecord | null> {
    return await SupabaseMoodStorage.getByDate(date, this.userId);
  }

  async getByDateRange(startDate: string, endDate: string): Promise<MoodRecord[]> {
    return await SupabaseMoodStorage.getByDateRange(startDate, endDate, this.userId);
  }

  async save(record: Omit<MoodRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MoodRecord> {
    return await SupabaseMoodStorage.upsert(record, this.userId);
  }

  async delete(id: string): Promise<boolean> {
    return await SupabaseMoodStorage.delete(id);
  }

  async getStats(): Promise<MoodStats> {
    const records = await this.getAll();
    return this.calculateStats(records);
  }

  async getWordFrequency(): Promise<WordFrequency[]> {
    const records = await this.getAll();
    return this.calculateWordFrequency(records);
  }

  async export(): Promise<string> {
    const records = await this.getAll();
    return JSON.stringify(records, null, 2);
  }

  async import(data: string): Promise<boolean> {
    try {
      const importedRecords = JSON.parse(data) as MoodRecord[];
      const validRecords = importedRecords.filter(record => 
        record.id && record.date && record.mood && record.diary !== undefined
      );
      
      if (validRecords.length === 0) {
        throw new Error('没有有效的记录可导入');
      }

      for (const record of validRecords) {
        await this.save({
          date: record.date,
          mood: record.mood,
          intensity: record.intensity,
          diary: record.diary,
          photo: record.photo,
          audio: record.audio,
          tags: record.tags,
        });
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async clear(): Promise<void> {
    // Supabase 数据清空需要手动操作
    console.warn('Supabase 数据清空需要在控制台手动操作');
  }

  // 上传媒体文件
  async uploadMedia(file: File, type: 'photo' | 'audio'): Promise<string> {
    return await SupabaseMoodStorage.uploadMedia(file, type, this.userId);
  }

  // 删除媒体文件
  async deleteMedia(url: string): Promise<boolean> {
    if (url.startsWith('data:')) {
      return true; // base64 数据不需要删除
    }
    return await SupabaseMoodStorage.deleteMedia(url);
  }

  // 计算统计数据
  private calculateStats(records: MoodRecord[]): MoodStats {
    const moodCounts: Record<string, number> = {
      happy: 0,
      sad: 0,
      anxious: 0,
      calm: 0,
      angry: 0,
      excited: 0,
      tired: 0,
      peaceful: 0,
    };

    records.forEach(record => {
      moodCounts[record.mood]++;
    });

    const totalIntensity = records.reduce((sum, record) => sum + record.intensity, 0);
    const averageIntensity = records.length > 0 ? totalIntensity / records.length : 0;

    const sortedRecords = records.sort((a, b) => b.date.localeCompare(a.date));
    const { currentStreak, longestStreak } = this.calculateStreaks(sortedRecords);

    return {
      totalRecords: records.length,
      moodCounts: moodCounts as any,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      currentStreak,
      longestStreak,
    };
  }

  // 计算词频
  private calculateWordFrequency(records: MoodRecord[]): WordFrequency[] {
    const wordMap = new Map<string, number>();

    const segmentText = (text: string): string[] => {
      return text
        .replace(/[，。！？；：""''（）【】《》、]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1 && word.length < 10)
        .filter(word => !/^\d+$/.test(word));
    };

    records.forEach(record => {
      if (record.diary) {
        const words = segmentText(record.diary);
        words.forEach(word => {
          wordMap.set(word, (wordMap.get(word) || 0) + 1);
        });
      }
    });

    return Array.from(wordMap.entries())
      .map(([word, frequency]) => ({ word, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 50);
  }

  // 计算连续记录天数
  private calculateStreaks(sortedRecords: MoodRecord[]): { currentStreak: number; longestStreak: number } {
    if (sortedRecords.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (sortedRecords[0].date === today || sortedRecords[0].date === yesterday) {
      currentStreak = 1;
      let expectedDate = sortedRecords[0].date === today ? yesterday : 
        new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      for (let i = 1; i < sortedRecords.length; i++) {
        if (sortedRecords[i].date === expectedDate) {
          currentStreak++;
          const prevDate = new Date(expectedDate);
          prevDate.setDate(prevDate.getDate() - 1);
          expectedDate = prevDate.toISOString().split('T')[0];
        } else {
          break;
        }
      }
    }

    for (let i = 1; i < sortedRecords.length; i++) {
      const currentDate = new Date(sortedRecords[i - 1].date);
      const prevDate = new Date(sortedRecords[i].date);
      const diffTime = currentDate.getTime() - prevDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    return { currentStreak, longestStreak };
  }

  // 设置用户ID
  setUserId(userId: string) {
    this.userId = userId;
  }

  // 获取存储类型
  getStorageType(): 'supabase' | 'local' {
    return 'supabase';
  }
}

export default HybridMoodStorage;