import React from 'react';
import styled from 'styled-components';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { MoodRecord, MOOD_LABELS, MOOD_ICONS } from '../types/mood';
import { theme } from '../styles/theme';

interface MoodDistributionChartProps {
  records: MoodRecord[];
  timeRange: 'week' | 'month' | 'year' | 'all';
}

const ChartContainer = styled(motion.div)`
  background: ${theme.colors.gradient.card};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.soft};
  margin-bottom: ${theme.spacing.xl};
`;

const ChartTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
  text-align: center;
`;

const ChartContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.xl};
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${theme.spacing.lg};
  }
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;
  position: relative;
  
  @media (max-width: 768px) {
    height: 250px;
  }
`;

const CenterText = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
`;

const CenterValue = styled.div`
  font-size: ${theme.typography.fontSize.xxl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const CenterLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const StatsPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const StatItem = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  border-radius: ${theme.borderRadius.medium};
  transition: all ${theme.animation.transition.normal};
  
  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateX(4px);
  }
`;

const MoodInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const MoodIcon = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$color}40;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const MoodDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const MoodName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const MoodCount = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const PercentageBar = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: ${theme.spacing.xs};
`;

const PercentageText = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const ProgressBar = styled.div`
  width: 80px;
  height: 6px;
  background: ${theme.colors.accent.warmGray};
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled(motion.div)<{ $color: string }>`
  height: 100%;
  background: ${props => props.$color};
  border-radius: 3px;
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
  grid-column: 1 / -1;
`;

const NoDataIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${theme.spacing.md};
  opacity: 0.5;
`;

const MoodDistributionChart: React.FC<MoodDistributionChartProps> = ({ 
  records, 
  timeRange 
}) => {
  const getMoodColor = (mood: string): string => {
    const colors: Record<string, string> = {
      happy: theme.colors.mood.happy,
      sad: theme.colors.mood.sad,
      anxious: theme.colors.mood.anxious,
      calm: theme.colors.mood.calm,
      angry: theme.colors.mood.angry,
      excited: theme.colors.mood.excited,
      tired: theme.colors.mood.tired,
      peaceful: theme.colors.mood.peaceful,
    };
    return colors[mood] || theme.colors.accent.warmGray;
  };

  const processDataForChart = () => {
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

    // 统计各种情绪的出现次数
    const moodCounts: Record<string, number> = {};
    filteredRecords.forEach(record => {
      moodCounts[record.mood] = (moodCounts[record.mood] || 0) + 1;
    });

    // 转换为图表数据格式
    const chartData = Object.entries(moodCounts)
      .map(([mood, count]) => ({
        mood,
        count,
        name: MOOD_LABELS[mood as keyof typeof MOOD_LABELS],
        percentage: Math.round((count / filteredRecords.length) * 100),
        color: getMoodColor(mood),
      }))
      .sort((a, b) => b.count - a.count);

    return chartData;
  };

  const chartData = processDataForChart();
  const totalRecords = chartData.reduce((sum, item) => sum + item.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          padding: theme.spacing.md,
          borderRadius: theme.borderRadius.medium,
          boxShadow: theme.shadows.hover,
          border: 'none',
          fontSize: theme.typography.fontSize.sm,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.sm,
            marginBottom: theme.spacing.xs,
          }}>
            <span style={{ fontSize: '1.2rem' }}>
              {MOOD_ICONS[data.mood as keyof typeof MOOD_ICONS]}
            </span>
            <span style={{ 
              fontWeight: theme.typography.fontWeight.semibold,
              color: theme.colors.text.primary,
            }}>
              {data.name}
            </span>
          </div>
          <p style={{ color: theme.colors.text.secondary }}>
            次数: {data.count}
          </p>
          <p style={{ color: theme.colors.text.secondary }}>
            占比: {data.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <ChartContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ChartTitle>情绪分布</ChartTitle>
        <NoDataMessage>
          <NoDataIcon>📊</NoDataIcon>
          <div>暂无数据</div>
          <div style={{ fontSize: theme.typography.fontSize.sm, marginTop: theme.spacing.xs }}>
            开始记录心情后，这里将显示你的情绪分布情况
          </div>
        </NoDataMessage>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <ChartTitle>情绪分布</ChartTitle>
      
      <ChartContent>
        <ChartWrapper>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={120}
                paddingAngle={2}
                dataKey="count"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          <CenterText>
            <CenterValue>{totalRecords}</CenterValue>
            <CenterLabel>总记录</CenterLabel>
          </CenterText>
        </ChartWrapper>

        <StatsPanel>
          {chartData.map((item, index) => (
            <StatItem
              key={item.mood}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <MoodInfo>
                <MoodIcon $color={item.color}>
                  {MOOD_ICONS[item.mood as keyof typeof MOOD_ICONS]}
                </MoodIcon>
                <MoodDetails>
                  <MoodName>{item.name}</MoodName>
                  <MoodCount>{item.count} 次记录</MoodCount>
                </MoodDetails>
              </MoodInfo>
              
              <PercentageBar>
                <PercentageText>{item.percentage}%</PercentageText>
                <ProgressBar>
                  <ProgressFill
                    $color={item.color}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                  />
                </ProgressBar>
              </PercentageBar>
            </StatItem>
          ))}
        </StatsPanel>
      </ChartContent>
    </ChartContainer>
  );
};

export default MoodDistributionChart;