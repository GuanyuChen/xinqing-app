import { MoodRecord, MoodType } from '../types/mood';

// 生成过去30天的示例数据
export const generateSampleData = (): MoodRecord[] => {
  const sampleRecords: MoodRecord[] = [];
  const today = new Date();
  
  const diaryTemplates = {
    happy: [
      '今天收到了好消息，心情特别好！和朋友一起吃饭聊天，感觉生活充满希望。',
      '阳光明媚的一天，做了很多喜欢的事情。看书、听音乐、散步，每一刻都很珍贵。',
      '工作顺利，同事夸赞了我的项目成果。晚上和家人视频聊天，感受到满满的爱。',
      '今天学会了新技能，很有成就感。生活中的小确幸总是能给我带来快乐。',
      '遇到了久违的老朋友，聊起往事感慨万千，但更多的是开心和感激。'
    ],
    sad: [
      '今天莫名其妙地感到失落，也许是天气的原因。需要给自己一些时间慢慢调整。',
      '看了一部感人的电影，忍不住哭了。有时候释放情绪也是一种治愈。',
      '想起了一些过往，心情有些沉重。但我知道这只是暂时的，明天会更好。',
      '工作压力让我有些沮丧，感觉做什么都提不起劲。需要好好休息一下。',
      '和朋友聊天时，听到她遇到的困难，感同身受，希望她能早日走出阴霾。'
    ],
    anxious: [
      '明天有重要的会议，心里有些紧张。一直在准备，希望能顺利进行。',
      '最近总是担心各种事情，睡眠质量也不太好。需要学会放松自己。',
      '收到一些不确定的消息，让我有些焦虑。深呼吸，告诉自己一切都会好的。',
      '新的挑战让我既兴奋又紧张，担心自己能否胜任。但我会尽力而为。',
      '家人的健康问题让我很担心，虽然医生说没有大问题，但还是放心不下。'
    ],
    calm: [
      '今天特别平静，没有太多起伏。静静地度过了美好的一天。',
      '在公园里坐了很久，看着来往的人群，内心很平和。这种宁静很珍贵。',
      '读了一本好书，心灵得到了净化。知识总能给我带来内心的平静。',
      '做了冥想练习，感觉心境开阔了许多。学会与自己的内心对话很重要。',
      '今天的工作很顺利，没有太多波澜。有时候平淡就是一种幸福。'
    ],
    angry: [
      '遇到了一些不公平的事情，让我很愤怒。但我会努力保持理性。',
      '交通堵塞，工作也不顺利，今天的耐心都用完了。需要冷静下来。',
      '看到一些社会不公的新闻，内心充满愤慨。希望世界能变得更美好。',
      '与人发生了争执，虽然后来和解了，但情绪还是受到了影响。',
      '今天的网络问题让我很恼火，重要的工作被耽误了。深呼吸，明天重新开始。'
    ],
    excited: [
      '收到了期待已久的好消息，兴奋得睡不着！新的机会即将到来。',
      '今天开始了新的项目，充满了期待和干劲。感觉每个细胞都在跳跃。',
      '计划了很久的旅行终于要开始了，想想就激动！要好好享受这次冒险。',
      '学到了很多新知识，感觉自己在不断成长。知识的力量让我兴奋不已。',
      '和喜欢的人约会，心情像小鹿乱撞。青春的感觉真好！'
    ],
    tired: [
      '连续加班好几天，身心都很疲惫。需要好好休息，给自己充充电。',
      '今天做了很多事情，感觉精力透支了。早点睡觉，明天会更有活力。',
      '天气闷热，整个人都没有精神。希望能有个清爽的雨天。',
      '最近睡眠不太好，白天总是昏昏沉沉的。要注意调整作息了。',
      '处理了很多琐事，虽然都是小事，但累积起来还是很耗人的。'
    ],
    peaceful: [
      '在海边静静地坐了一下午，听着海浪声，内心无比宁静。',
      '做了瑜伽和冥想，感觉身心都得到了净化。这种平和的感觉很珍贵。',
      '在花园里种花，与大自然亲密接触，心情格外宁静祥和。',
      '听了一整晚的轻音乐，什么都不想，就这样静静地享受时光。',
      '和家人一起安静地吃晚饭，简单的幸福让内心充满平静。'
    ]
  };

  const intensityPatterns = {
    happy: [3, 4, 5, 4, 5],
    sad: [2, 3, 2, 3, 1],
    anxious: [3, 4, 3, 2, 4],
    calm: [3, 4, 3, 4, 3],
    angry: [4, 5, 3, 4, 2],
    excited: [5, 4, 5, 4, 5],
    tired: [2, 1, 2, 3, 1],
    peaceful: [4, 5, 4, 3, 4],
  };

  // 生成过去30天的数据，但不是每天都有记录
  for (let i = 0; i < 30; i++) {
    // 70%的概率有记录
    if (Math.random() < 0.7) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // 根据星期几和日期影响心情选择
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isMonday = dayOfWeek === 1;

      let moodProbabilities: Record<MoodType, number>;

      if (isMonday) {
        // 周一更可能疲惫或焦虑
        moodProbabilities = {
          tired: 0.25,
          anxious: 0.2,
          calm: 0.15,
          happy: 0.1,
          peaceful: 0.1,
          sad: 0.1,
          excited: 0.05,
          angry: 0.05,
        };
      } else if (isWeekend) {
        // 周末更可能开心或平静
        moodProbabilities = {
          happy: 0.3,
          peaceful: 0.25,
          calm: 0.2,
          excited: 0.1,
          tired: 0.05,
          sad: 0.05,
          anxious: 0.03,
          angry: 0.02,
        };
      } else {
        // 平日比较均衡
        moodProbabilities = {
          calm: 0.25,
          happy: 0.2,
          tired: 0.15,
          peaceful: 0.12,
          anxious: 0.1,
          excited: 0.08,
          sad: 0.06,
          angry: 0.04,
        };
      }

      // 根据概率选择心情
      const randomValue = Math.random();
      let cumulativeProbability = 0;
      let selectedMood: MoodType = 'calm';

      for (const [mood, probability] of Object.entries(moodProbabilities)) {
        cumulativeProbability += probability;
        if (randomValue <= cumulativeProbability) {
          selectedMood = mood as MoodType;
          break;
        }
      }

      // 选择强度
      const intensityOptions = intensityPatterns[selectedMood];
      const intensity = intensityOptions[Math.floor(Math.random() * intensityOptions.length)];

      // 选择日记内容
      const diaryOptions = diaryTemplates[selectedMood];
      const diary = diaryOptions[Math.floor(Math.random() * diaryOptions.length)];

      // 添加一些变化，让内容更丰富
      const variations = [
        '', // 原文
        ' 希望明天会更好。',
        ' 感谢生活中的每一个瞬间。',
        ' 这也是成长的一部分吧。',
        ' 继续加油！',
        ' 相信一切都会越来越好的。',
      ];
      
      const variation = variations[Math.floor(Math.random() * variations.length)];
      const finalDiary = diary + variation;

      const record: MoodRecord = {
        id: `sample-${i}-${Date.now()}`,
        date: dateStr,
        mood: selectedMood,
        intensity,
        diary: finalDiary,
        photo: undefined, // 示例数据不包含媒体文件
        audio: undefined,
        tags: [], // 可以后续添加标签功能
        createdAt: new Date(date.getTime() + Math.random() * 86400000), // 随机时间
        updatedAt: new Date(date.getTime() + Math.random() * 86400000),
      };

      sampleRecords.push(record);
    }
  }

  return sampleRecords.sort((a, b) => b.date.localeCompare(a.date));
};

// 检查是否需要生成示例数据
export const shouldGenerateSampleData = (existingRecords: MoodRecord[]): boolean => {
  return existingRecords.length === 0;
};

// 生成特定心情的示例记录（用于演示）
export const generateMoodSample = (mood: MoodType): Omit<MoodRecord, 'id' | 'createdAt' | 'updatedAt'> => {
  const today = new Date().toISOString().split('T')[0];
  
  const diaryTemplates = {
    happy: '今天心情特别好！阳光明媚，做了很多喜欢的事情。',
    sad: '今天有些失落，但我知道这只是暂时的，明天会更好。',
    anxious: '有些担心明天的事情，需要深呼吸，告诉自己一切都会好的。',
    calm: '今天很平静，静静地度过了美好的一天。',
    angry: '遇到了一些让人生气的事，但我会努力保持理性。',
    excited: '收到了好消息，兴奋得睡不着！新的机会即将到来。',
    tired: '今天很累，需要好好休息，给自己充充电。',
    peaceful: '内心很宁静，享受这难得的平和时光。',
  };

  const intensityRange = {
    happy: [4, 5],
    sad: [2, 3],
    anxious: [3, 4],
    calm: [3, 4],
    angry: [4, 5],
    excited: [4, 5],
    tired: [1, 2],
    peaceful: [4, 5],
  };

  const range = intensityRange[mood];
  const intensity = range[Math.floor(Math.random() * range.length)];

  return {
    date: today,
    mood,
    intensity,
    diary: diaryTemplates[mood],
    photo: undefined,
    audio: undefined,
    tags: [],
  };
};