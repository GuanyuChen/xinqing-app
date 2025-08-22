import React from 'react';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { MoodRecord, MOOD_LABELS } from '../types/mood';
import { theme } from '../styles/theme';

interface MoodTrendChartProps {
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

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;
  margin-bottom: ${theme.spacing.lg};
`;

const Legend = styled.div`
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.lg};
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 3px;
  background: ${props => props.$color};
  border-radius: 1px;
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

const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ records, timeRange }) => {
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
      case 'all':
        startDate.setFullYear(now.getFullYear() - 10); // 显示最近10年的数据
        break;
    }

    const filteredRecords = records.filter(record => 
      new Date(record.date) >= startDate
    ).sort((a, b) => a.date.localeCompare(b.date));

    // 将心情转换为数值进行趋势分析
    const moodToValue: Record<string, number> = {
      angry: 1,
      sad: 2,
      anxious: 3,
      tired: 4,
      calm: 5,
      peaceful: 6,
      happy: 7,
      excited: 8,
    };

    return filteredRecords.map(record => {
      const date = new Date(record.date);
      const formatDate = (date: Date) => {
        switch (timeRange) {
          case 'week':
            return date.toLocaleDateString('zh-CN', { weekday: 'short', month: 'short', day: 'numeric' });
          case 'month':
            return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
          case 'year':
            return date.toLocaleDateString('zh-CN', { month: 'short' });
          case 'all':
            return date.toLocaleDateString('zh-CN', { year: '2-digit', month: 'short' });
          default:
            return date.toLocaleDateString('zh-CN');
        }
      };

      return {
        date: formatDate(date),
        fullDate: record.date,
        mood: record.mood,
        moodValue: moodToValue[record.mood] || 5,
        intensity: record.intensity,
        combinedValue: (moodToValue[record.mood] || 5) + (record.intensity - 3) * 0.5, // 结合情绪类型和强度
        diary: record.diary,
      };
    });
  };

  const chartData = processDataForChart();

  const CustomTooltip = ({ active, payload, label }: any) => {
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
          <p style={{ 
            fontWeight: theme.typography.fontWeight.semibold,
            marginBottom: theme.spacing.xs,
            color: theme.colors.text.primary,
          }}>
            {label}
          </p>
          <p style={{ 
            color: getMoodColor(data.mood),
            marginBottom: theme.spacing.xs,
          }}>
            心情: {MOOD_LABELS[data.mood as keyof typeof MOOD_LABELS]}
          </p>
          <p style={{ color: theme.colors.text.secondary }}>
            强度: {data.intensity}/5
          </p>
          {data.diary && (
            <p style={{ 
              color: theme.colors.text.light,
              marginTop: theme.spacing.xs,
              maxWidth: '200px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {data.diary}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const getUniqueColors = () => {
    const uniqueMoods = Array.from(new Set(chartData.map(item => item.mood)));
    return uniqueMoods.map(mood => ({
      mood,
      color: getMoodColor(mood),
      label: MOOD_LABELS[mood as keyof typeof MOOD_LABELS],
    }));
  };

  if (chartData.length === 0) {
    return (
      <ChartContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ChartTitle>情绪趋势</ChartTitle>
        <NoDataMessage>
          <NoDataIcon>📈</NoDataIcon>
          <div>暂无数据</div>
          <div style={{ fontSize: theme.typography.fontSize.sm, marginTop: theme.spacing.xs }}>
            开始记录心情后，这里将显示你的情绪变化趋势
          </div>
        </NoDataMessage>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ChartTitle>情绪趋势</ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={theme.colors.accent.warmGray}
              opacity={0.5}
            />
            <XAxis 
              dataKey="date" 
              stroke={theme.colors.text.light}
              fontSize={12}
              tick={{ fill: theme.colors.text.light }}
            />
            <YAxis 
              domain={[0, 10]}
              stroke={theme.colors.text.light}
              fontSize={12}
              tick={{ fill: theme.colors.text.light }}
              tickFormatter={(value) => {
                const labels = ['', '愤怒', '难过', '焦虑', '疲惫', '平静', '宁静', '开心', '兴奋', '', ''];
                return labels[value] || '';
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="combinedValue" 
              stroke={theme.colors.accent.deepLavender}
              strokeWidth={3}
              dot={{ 
                r: 6, 
                stroke: theme.colors.accent.deepLavender,
                strokeWidth: 2,
                fill: theme.colors.primary.cream,
              }}
              activeDot={{ 
                r: 8, 
                stroke: theme.colors.accent.deepLavender,
                strokeWidth: 3,
                fill: theme.colors.accent.deepLavender,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
      
      <Legend>
        <LegendItem>
          <LegendColor $color={theme.colors.accent.deepLavender} />
          <span>情绪趋势</span>
        </LegendItem>
        {getUniqueColors().slice(0, 4).map(({ mood, color, label }) => (
          <LegendItem key={mood}>
            <LegendColor $color={color} />
            <span>{label}</span>
          </LegendItem>
        ))}
      </Legend>
    </ChartContainer>
  );
};

export default MoodTrendChart;