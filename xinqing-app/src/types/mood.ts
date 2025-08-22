export type MoodType = 
  | 'happy'     // 开心
  | 'sad'       // 难过
  | 'anxious'   // 焦虑
  | 'calm'      // 平静
  | 'angry'     // 愤怒
  | 'excited'   // 兴奋
  | 'tired'     // 疲惫
  | 'peaceful'  // 宁静
  | string;     // 支持自定义心情

export interface CustomMood {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  createdAt: Date;
  userId?: string;
}

export interface MoodRecord {
  id: string;
  date: string; // ISO 8601 格式: YYYY-MM-DD
  mood: MoodType;
  intensity: number; // 1-5 情绪强度
  diary: string;
  photo?: string; // base64 或 URL
  audio?: string; // base64 或 URL
  tags?: string[]; // 可选标签
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodStats {
  totalRecords: number;
  moodCounts: Record<MoodType, number>;
  averageIntensity: number;
  currentStreak: number; // 连续记录天数
  longestStreak: number;
}

export interface WordFrequency {
  word: string;
  frequency: number;
}

export const MOOD_LABELS: Record<MoodType, string> = {
  happy: '开心',
  sad: '难过',
  anxious: '焦虑',
  calm: '平静',
  angry: '愤怒',
  excited: '兴奋',
  tired: '疲惫',
  peaceful: '宁静',
};

export const MOOD_ICONS: Record<MoodType, string> = {
  happy: '😊',
  sad: '😢',
  anxious: '😰',
  calm: '😌',
  angry: '😡',
  excited: '🤩',
  tired: '😴',
  peaceful: '🧘‍♀️',
};

export const MOOD_DESCRIPTIONS: Record<MoodType, string> = {
  happy: '感到快乐和满足',
  sad: '感到悲伤或沮丧',
  anxious: '感到紧张或担心',
  calm: '感到平静和放松',
  angry: '感到愤怒或烦躁',
  excited: '感到兴奋或激动',
  tired: '感到疲惫或倦怠',
  peaceful: '感到内心宁静',
};