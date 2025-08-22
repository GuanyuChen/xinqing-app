import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MoodRecord } from '../types/mood';
import { theme } from '../styles/theme';
import MoodCalendar from '../components/MoodCalendar';
import MoodList from '../components/MoodList';
import HybridMoodStorage from '../utils/hybridStorage';

const Container = styled.div`
  padding: ${theme.spacing.lg};
  background: transparent;
  
  @media (min-width: 769px) {
    padding: ${theme.spacing.lg};
    max-width: 100%;
    margin: 0 auto;
  }
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

const ViewToggle = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.xl};
`;

const ToggleButton = styled(motion.button)<{ $active: boolean }>`
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
        : theme.colors.accent.deepLavender + '20'
    };
    border-color: ${theme.colors.accent.deepLavender};
    transform: translateY(-1px);
  }
`;

const ContentContainer = styled(motion.div)`
  max-width: 1200px;
  margin: 0 auto;
`;

const CalendarSection = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.soft};
  margin-bottom: ${theme.spacing.xl};
`;

const StatsBar = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
`;

const StatCard = styled.div`
  background: ${theme.colors.gradient.card};
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  text-align: center;
  box-shadow: ${theme.shadows.gentle};
  transition: all ${theme.animation.transition.normal};
  
  &:hover {
    box-shadow: ${theme.shadows.hover};
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: ${theme.typography.fontSize.xxl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
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

type ViewMode = 'calendar' | 'list';

const HistoryPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
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
      setError('加载记录失败，请刷新页面重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleRecordClick = (record: MoodRecord) => {
    // 可以导航到详情页面或打开模态框
    console.log('点击记录:', record);
  };

  const getStats = () => {
    if (records.length === 0) {
      return {
        totalDays: 0,
        currentStreak: 0,
        avgIntensity: 0,
        totalMoods: 0,
      };
    }

    const totalDays = records.length;
    const totalIntensity = records.reduce((sum, record) => sum + record.intensity, 0);
    const avgIntensity = Math.round((totalIntensity / totalDays) * 10) / 10;

    // 计算连续记录天数
    const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date));
    let currentStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    if (sortedRecords.length > 0) {
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
    }

    const uniqueMoods = new Set(records.map(record => record.mood)).size;

    return {
      totalDays,
      currentStreak,
      avgIntensity,
      totalMoods: uniqueMoods,
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            ⏳
          </motion.div>
          <span style={{ marginLeft: theme.spacing.md }}>正在加载记录...</span>
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
        <Title>心情历史</Title>
        <Subtitle>回顾过去的情感轨迹，发现内心的变化</Subtitle>
      </Header>

      <ContentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <StatsBar
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <StatCard>
            <StatValue>{stats.totalDays}</StatValue>
            <StatLabel>记录天数</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.currentStreak}</StatValue>
            <StatLabel>连续记录</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.avgIntensity}</StatValue>
            <StatLabel>平均强度</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.totalMoods}</StatValue>
            <StatLabel>情绪类型</StatLabel>
          </StatCard>
        </StatsBar>

        <ViewToggle>
          <ToggleButton
            $active={viewMode === 'calendar'}
            onClick={() => setViewMode('calendar')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            📅 日历视图
          </ToggleButton>
          <ToggleButton
            $active={viewMode === 'list'}
            onClick={() => setViewMode('list')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            📝 列表视图
          </ToggleButton>
        </ViewToggle>

        <motion.div
          key={viewMode}
          initial={{ opacity: 0, x: viewMode === 'calendar' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {viewMode === 'calendar' ? (
            <CalendarSection>
              <MoodCalendar
                records={records}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                isLoading={false}
              />
            </CalendarSection>
          ) : (
            <MoodList
              records={records}
              onRecordClick={handleRecordClick}
              isLoading={false}
            />
          )}
        </motion.div>
      </ContentContainer>
    </Container>
  );
};

export default HistoryPage;