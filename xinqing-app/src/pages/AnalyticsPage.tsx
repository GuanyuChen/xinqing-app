import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MoodRecord } from '../types/mood';
import { theme } from '../styles/theme';
import MoodTrendChart from '../components/MoodTrendChart';
import MoodDistributionChart from '../components/MoodDistributionChart';
import WordCloud from '../components/WordCloud';
import HybridMoodStorage from '../utils/hybridStorage';

const Container = styled.div`
  min-height: 100vh;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.gradient.primary};
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${theme.typography.fontSize.xxxl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
  background: linear-gradient(135deg, ${theme.colors.text.primary} 0%, ${theme.colors.accent.deepLavender} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.lg};
`;

const TimeRangeSelector = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xl};
  flex-wrap: wrap;
`;

const TimeButton = styled(motion.button)<{ $active: boolean }>`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${props => 
    props.$active 
      ? theme.colors.accent.deepLavender 
      : 'rgba(255, 255, 255, 0.7)'
  };
  color: ${props => 
    props.$active 
      ? 'white' 
      : theme.colors.text.secondary
  };
  border: 1px solid ${props => 
    props.$active 
      ? theme.colors.accent.deepLavender 
      : theme.colors.accent.warmGray
  };
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.transition.normal};
  backdrop-filter: blur(5px);
  
  &:hover {
    background: ${props => 
      props.$active 
        ? theme.colors.accent.deepLavender 
        : theme.colors.accent.deepLavender + '30'
    };
    border-color: ${theme.colors.accent.deepLavender};
    transform: translateY(-1px);
  }
`;

const ContentContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
`;

const SummaryCards = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const SummaryCard = styled.div`
  background: ${theme.colors.gradient.card};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  text-align: center;
  box-shadow: ${theme.shadows.soft};
  transition: all ${theme.animation.transition.normal};
  
  &:hover {
    box-shadow: ${theme.shadows.hover};
    transform: translateY(-2px);
  }
`;

const SummaryIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${theme.spacing.md};
`;

const SummaryValue = styled.div`
  font-size: ${theme.typography.fontSize.xxl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const SummaryLabel = styled.div`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
`;

const SummaryDescription = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.light};
  line-height: ${theme.typography.lineHeight.normal};
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${theme.spacing.xl};
  
  @media (min-width: 1200px) {
    &.two-column {
      grid-template-columns: 2fr 1fr;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  color: ${theme.colors.text.secondary};
`;

type TimeRange = 'week' | 'month' | 'year' | 'all';

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storage] = useState(() => new HybridMoodStorage());

  useEffect(() => {
    loadRecords();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const allRecords = await storage.getAll();
      setRecords(allRecords);
    } catch (err) {
      console.error('加载记录失败:', err);
      setError('加载数据失败，请刷新页面重试');
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredRecords = () => {
    if (timeRange === 'all') return records;

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

    return records.filter(record => new Date(record.date) >= startDate);
  };

  const getSummaryData = () => {
    const filteredRecords = getFilteredRecords();
    
    if (filteredRecords.length === 0) {
      return {
        totalRecords: 0,
        avgIntensity: 0,
        mostCommonMood: '无数据',
        totalWords: 0,
      };
    }

    // 计算平均强度
    const totalIntensity = filteredRecords.reduce((sum, record) => sum + record.intensity, 0);
    const avgIntensity = Math.round((totalIntensity / filteredRecords.length) * 10) / 10;

    // 找出最常见的情绪
    const moodCounts: Record<string, number> = {};
    filteredRecords.forEach(record => {
      moodCounts[record.mood] = (moodCounts[record.mood] || 0) + 1;
    });
    
    const mostCommonMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '无数据';

    // 计算总词汇数
    const totalWords = filteredRecords.reduce((sum, record) => {
      if (!record.diary) return sum;
      const wordCount = record.diary
        .replace(/[，。！？；：""''（）【】《》、\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1).length;
      return sum + wordCount;
    }, 0);

    return {
      totalRecords: filteredRecords.length,
      avgIntensity,
      mostCommonMood,
      totalWords,
    };
  };

  const summary = getSummaryData();
  const filteredRecords = getFilteredRecords();

  const getTimeRangeText = () => {
    switch (timeRange) {
      case 'week': return '最近一周';
      case 'month': return '最近一个月'; 
      case 'year': return '最近一年';
      case 'all': return '全部时间';
    }
  };

  const getMoodLabel = (mood: string) => {
    const labels: Record<string, string> = {
      happy: '开心',
      sad: '难过',
      anxious: '焦虑',
      calm: '平静',
      angry: '愤怒',
      excited: '兴奋',
      tired: '疲惫',
      peaceful: '宁静',
    };
    return labels[mood] || mood;
  };

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            📊
          </motion.div>
          <span style={{ marginLeft: theme.spacing.md }}>正在分析数据...</span>
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorContainer>
          <div style={{ fontSize: '3rem', marginBottom: theme.spacing.lg }}>😔</div>
          <div style={{ marginBottom: theme.spacing.md }}>{error}</div>
          <motion.button
            onClick={loadRecords}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              padding: `${theme.spacing.md} ${theme.spacing.lg}`,
              background: theme.colors.accent.deepLavender,
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.medium,
              cursor: 'pointer',
            }}
          >
            重新加载
          </motion.button>
        </ErrorContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>趋势分析</Title>
        <Subtitle>深入了解你的情绪模式和变化趋势</Subtitle>
      </Header>

      <ContentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <TimeRangeSelector>
          {[
            { key: 'week', label: '最近一周' },
            { key: 'month', label: '最近一月' },
            { key: 'year', label: '最近一年' },
            { key: 'all', label: '全部时间' },
          ].map(({ key, label }) => (
            <TimeButton
              key={key}
              $active={timeRange === key}
              onClick={() => setTimeRange(key as TimeRange)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {label}
            </TimeButton>
          ))}
        </TimeRangeSelector>

        <SummaryCards
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SummaryCard>
            <SummaryIcon>📝</SummaryIcon>
            <SummaryValue>{summary.totalRecords}</SummaryValue>
            <SummaryLabel>记录数量</SummaryLabel>
            <SummaryDescription>
              {getTimeRangeText()}内的心情记录总数
            </SummaryDescription>
          </SummaryCard>
          
          <SummaryCard>
            <SummaryIcon>📊</SummaryIcon>
            <SummaryValue>{summary.avgIntensity}</SummaryValue>
            <SummaryLabel>平均强度</SummaryLabel>
            <SummaryDescription>
              情绪强度的平均值，范围 1-5
            </SummaryDescription>
          </SummaryCard>
          
          <SummaryCard>
            <SummaryIcon>😊</SummaryIcon>
            <SummaryValue>{getMoodLabel(summary.mostCommonMood)}</SummaryValue>
            <SummaryLabel>主要情绪</SummaryLabel>
            <SummaryDescription>
              出现频率最高的情绪类型
            </SummaryDescription>
          </SummaryCard>
          
          <SummaryCard>
            <SummaryIcon>✍️</SummaryIcon>
            <SummaryValue>{summary.totalWords}</SummaryValue>
            <SummaryLabel>总词汇数</SummaryLabel>
            <SummaryDescription>
              日记中包含的词汇总量
            </SummaryDescription>
          </SummaryCard>
        </SummaryCards>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <MoodTrendChart records={filteredRecords} timeRange={timeRange} />
        </motion.div>

        <ChartGrid className="two-column">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <MoodDistributionChart records={filteredRecords} timeRange={timeRange} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <WordCloud records={filteredRecords} timeRange={timeRange} />
          </motion.div>
        </ChartGrid>
      </ContentContainer>
    </Container>
  );
};

export default AnalyticsPage;