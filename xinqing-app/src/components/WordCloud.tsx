import React, { useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MoodRecord } from '../types/mood';
import { theme } from '../styles/theme';

interface WordCloudProps {
  records: MoodRecord[];
  timeRange: 'week' | 'month' | 'year' | 'all';
  maxWords?: number;
}

const CloudContainer = styled(motion.div)`
  background: ${theme.colors.gradient.card};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.soft};
  margin-bottom: ${theme.spacing.xl};
`;

const CloudTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
`;

const WordCloudWrapper = styled.div`
  min-height: 300px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg};
  position: relative;
  overflow: hidden;
`;

const WordItem = styled(motion.span)<{ 
  $size: number; 
  $color: string; 
  $opacity: number;
}>`
  font-size: ${props => Math.max(12, props.$size)}px;
  font-weight: ${props => props.$size > 20 ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium};
  color: ${props => props.$color};
  opacity: ${props => props.$opacity};
  cursor: pointer;
  user-select: none;
  transition: all ${theme.animation.transition.normal};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  line-height: 1.2;
  
  &:hover {
    opacity: 1 !important;
    transform: scale(1.1);
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(5px);
    box-shadow: ${theme.shadows.gentle};
  }
`;

const WordStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.md};
  text-align: center;
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const NoDataMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  color: ${theme.colors.text.light};
  font-size: ${theme.typography.fontSize.lg};
  text-align: center;
`;

const NoDataIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${theme.spacing.md};
  opacity: 0.5;
`;

const FilterInfo = styled.div`
  text-align: center;
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.light};
  margin-bottom: ${theme.spacing.lg};
  font-style: italic;
`;

const WordCloud: React.FC<WordCloudProps> = ({ 
  records, 
  timeRange, 
  maxWords = 50 
}) => {
  const wordFrequency = useMemo(() => {
    if (records.length === 0) return [];

    // 根据时间范围过滤数据
    let filteredRecords = records;
    if (timeRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filteredRecords = records.filter(record => 
        new Date(record.date) >= startDate
      );
    }

    const wordMap = new Map<string, number>();

    // 简单的中文分词
    const segmentText = (text: string): string[] => {
      return text
        .replace(/[，。！？；：""''（）【】《》、\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1 && word.length < 8)
        .filter(word => !/^\d+$/.test(word))
        .filter(word => !['今天', '昨天', '明天', '这个', '那个', '一个', '这样', '那样', '感觉', '觉得', '可能', '应该', '因为', '所以'].includes(word));
    };

    filteredRecords.forEach(record => {
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
      .slice(0, maxWords);
  }, [records, timeRange, maxWords]);

  const getWordSize = (frequency: number, maxFreq: number): number => {
    const minSize = 12;
    const maxSize = 32;
    return minSize + (frequency / maxFreq) * (maxSize - minSize);
  };

  const getWordColor = (frequency: number, maxFreq: number): string => {
    const colors = [
      theme.colors.mood.peaceful,
      theme.colors.mood.calm,
      theme.colors.mood.happy,
      theme.colors.accent.deepLavender,
      theme.colors.mood.excited,
    ];
    
    const colorIndex = Math.floor((frequency / maxFreq) * (colors.length - 1));
    return colors[colorIndex] || colors[0];
  };

  const getWordOpacity = (frequency: number, maxFreq: number): number => {
    return 0.6 + (frequency / maxFreq) * 0.4;
  };

  const maxFrequency = wordFrequency.length > 0 ? wordFrequency[0].frequency : 1;
  const totalWords = wordFrequency.reduce((sum, item) => sum + item.frequency, 0);
  const uniqueWords = wordFrequency.length;
  const avgWordLength = wordFrequency.length > 0 
    ? Math.round(wordFrequency.reduce((sum, item) => sum + item.word.length, 0) / wordFrequency.length * 10) / 10 
    : 0;

  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'week': return '最近一周';
      case 'month': return '最近一个月';
      case 'year': return '最近一年';
      case 'all': return '全部时间';
      default: return '';
    }
  };

  if (wordFrequency.length === 0) {
    return (
      <CloudContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <CloudTitle>词云分析</CloudTitle>
        <NoDataMessage>
          <NoDataIcon>☁️</NoDataIcon>
          <div>暂无词汇数据</div>
          <div style={{ fontSize: theme.typography.fontSize.sm, marginTop: theme.spacing.xs }}>
            写一些日记内容后，这里将显示你使用频率最高的词汇
          </div>
        </NoDataMessage>
      </CloudContainer>
    );
  }

  return (
    <CloudContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <CloudTitle>词云分析</CloudTitle>
      <FilterInfo>基于{getTimeRangeText()}的日记内容生成</FilterInfo>
      
      <WordCloudWrapper>
        {wordFrequency.map((item, index) => (
          <WordItem
            key={item.word}
            $size={getWordSize(item.frequency, maxFrequency)}
            $color={getWordColor(item.frequency, maxFrequency)}
            $opacity={getWordOpacity(item.frequency, maxFrequency)}
            initial={{ 
              opacity: 0, 
              scale: 0,
              rotate: Math.random() * 20 - 10 
            }}
            animate={{ 
              opacity: getWordOpacity(item.frequency, maxFrequency), 
              scale: 1,
              rotate: 0 
            }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.02,
              type: "spring",
              stiffness: 100,
              damping: 10
            }}
            whileHover={{ 
              scale: 1.2,
              zIndex: 10,
              transition: { duration: 0.2 }
            }}
            title={`"${item.word}" 出现 ${item.frequency} 次`}
          >
            {item.word}
          </WordItem>
        ))}
      </WordCloudWrapper>

      <WordStats>
        <StatCard>
          <StatValue>{totalWords}</StatValue>
          <StatLabel>总词汇数</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{uniqueWords}</StatValue>
          <StatLabel>独特词汇</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{maxFrequency}</StatValue>
          <StatLabel>最高频次</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{avgWordLength}</StatValue>
          <StatLabel>平均词长</StatLabel>
        </StatCard>
      </WordStats>
    </CloudContainer>
  );
};

export default WordCloud;