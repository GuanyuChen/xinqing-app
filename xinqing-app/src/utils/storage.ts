import { MoodRecord, MoodStats, WordFrequency, MoodType } from '../types/mood';

class MoodStorage {
  private static readonly STORAGE_KEY = 'xinqing_mood_records';

  // 获取所有记录
  static getAll(): MoodRecord[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const records = JSON.parse(data) as MoodRecord[];
      return records.map(record => ({
        ...record,
        createdAt: new Date(record.createdAt),
        updatedAt: new Date(record.updatedAt),
      }));
    } catch (error) {
      console.error('获取心情记录失败:', error);
      return [];
    }
  }

  // 根据日期获取记录
  static getByDate(date: string): MoodRecord | null {
    const records = this.getAll();
    return records.find(record => record.date === date) || null;
  }

  // 获取日期范围内的记录
  static getByDateRange(startDate: string, endDate: string): MoodRecord[] {
    const records = this.getAll();
    return records.filter(record => 
      record.date >= startDate && record.date <= endDate
    ).sort((a, b) => a.date.localeCompare(b.date));
  }

  // 保存单条记录
  static save(record: Omit<MoodRecord, 'id' | 'createdAt' | 'updatedAt'>): MoodRecord {
    const records = this.getAll();
    const existingRecord = records.find(r => r.date === record.date);
    
    if (existingRecord) {
      // 更新现有记录
      const updatedRecord: MoodRecord = {
        ...existingRecord,
        ...record,
        updatedAt: new Date(),
      };
      
      const updatedRecords = records.map(r => 
        r.date === record.date ? updatedRecord : r
      );
      
      this.saveAll(updatedRecords);
      return updatedRecord;
    } else {
      // 创建新记录
      const newRecord: MoodRecord = {
        id: this.generateId(),
        ...record,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const updatedRecords = [...records, newRecord];
      this.saveAll(updatedRecords);
      return newRecord;
    }
  }

  // 删除记录
  static delete(id: string): boolean {
    try {
      const records = this.getAll();
      const filteredRecords = records.filter(record => record.id !== id);
      
      if (filteredRecords.length === records.length) {
        return false; // 没有找到要删除的记录
      }
      
      this.saveAll(filteredRecords);
      return true;
    } catch (error) {
      console.error('删除心情记录失败:', error);
      return false;
    }
  }

  // 保存所有记录
  private static saveAll(records: MoodRecord[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('保存心情记录失败:', error);
      throw new Error('存储空间不足或其他存储错误');
    }
  }

  // 生成唯一ID
  private static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // 获取统计数据
  static getStats(): MoodStats {
    const records = this.getAll();
    
    const moodCounts: Record<MoodType, number> = {
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

    // 计算连续记录天数
    const sortedRecords = records.sort((a, b) => b.date.localeCompare(a.date));
    const { currentStreak, longestStreak } = this.calculateStreaks(sortedRecords);

    return {
      totalRecords: records.length,
      moodCounts,
      averageIntensity: Math.round(averageIntensity * 10) / 10,
      currentStreak,
      longestStreak,
    };
  }

  // 计算连续记录天数
  private static calculateStreaks(sortedRecords: MoodRecord[]): { currentStreak: number; longestStreak: number } {
    if (sortedRecords.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // 计算当前连续记录天数
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

    // 计算最长连续记录天数
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

  // 获取词频统计
  static getWordFrequency(): WordFrequency[] {
    const records = this.getAll();
    const wordMap = new Map<string, number>();

    // 简单的中文分词（基于标点符号和空格）
    const segmentText = (text: string): string[] => {
      return text
        .replace(/[，。！？；：""''（）【】《》、]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1 && word.length < 10)
        .filter(word => !/^\d+$/.test(word)); // 过滤纯数字
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
      .slice(0, 50); // 取前50个高频词
  }

  // 导出数据
  static export(): string {
    const records = this.getAll();
    return JSON.stringify(records, null, 2);
  }

  // 导入数据
  static import(data: string): boolean {
    try {
      const importedRecords = JSON.parse(data) as MoodRecord[];
      const validRecords = importedRecords.filter(record => 
        record.id && record.date && record.mood && record.diary !== undefined
      );
      
      if (validRecords.length === 0) {
        throw new Error('没有有效的记录可导入');
      }

      const existingRecords = this.getAll();
      const mergedRecords = [...existingRecords];

      validRecords.forEach(importedRecord => {
        const existingIndex = mergedRecords.findIndex(r => r.date === importedRecord.date);
        if (existingIndex >= 0) {
          // 覆盖现有记录
          mergedRecords[existingIndex] = {
            ...importedRecord,
            updatedAt: new Date(),
          };
        } else {
          // 添加新记录
          mergedRecords.push({
            ...importedRecord,
            createdAt: new Date(importedRecord.createdAt || importedRecord.updatedAt),
            updatedAt: new Date(),
          });
        }
      });

      this.saveAll(mergedRecords);
      return true;
    } catch (error) {
      console.error('导入数据失败:', error);
      return false;
    }
  }

  // 清空所有数据
  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export default MoodStorage;