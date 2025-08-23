import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { MoodRecord } from '../types/mood';
import { theme } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';
import MoodTrendChart from '../components/MoodTrendChart';
import MoodDistributionChart from '../components/MoodDistributionChart';
import WordCloud from '../components/WordCloud';
import UserMoodStorage from '../utils/userMoodStorage';
import UserCustomMoodStorage from '../utils/userCustomMoodStorage';
import SimpleLoading from '../components/SimpleLoading';

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
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const UserInfoSection = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.lg};
  background: ${theme.colors.gradient.card};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.soft};
  border: 1px solid rgba(255, 255, 255, 0.3);
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const UserAvatar = styled.div<{ $src?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: ${props => props.$src ? `url(${props.$src})` : `linear-gradient(135deg, ${theme.colors.accent.deepLavender}, ${theme.colors.accent.softPink})`};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${theme.typography.fontWeight.bold};
  font-size: 2rem;
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: ${theme.shadows.gentle};
  flex-shrink: 0;
`;

const UserDetails = styled.div`
  flex: 1;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`;

const UserName = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  background: linear-gradient(135deg, ${theme.colors.text.primary} 0%, ${theme.colors.accent.deepLavender} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const UserEmail = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
`;

const UserStats = styled.div`
  display: flex;
  gap: ${theme.spacing.lg};
  margin-top: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    justify-content: center;
    flex-wrap: wrap;
  }
`;

const UserStat = styled.div`
  text-align: center;
`;

const UserStatValue = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.accent.deepLavender};
`;

const UserStatLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.light};
  margin-top: ${theme.spacing.xs};
`;

const WelcomeSection = styled.div`
  background: linear-gradient(135deg, ${theme.colors.accent.deepLavender}15, ${theme.colors.accent.softPink}15);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const WelcomeTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const WelcomeMessage = styled.p`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.relaxed};
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
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.xxl};
  }
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.base};
  }
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
  
  @media (min-width: 769px) {
    max-width: 100%;
  }
`;

const SummaryCards = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.xl};
  
  @media (min-width: 769px) {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: ${theme.spacing.xl};
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  }
  
  @media (min-width: 1400px) {
    grid-template-columns: repeat(4, 1fr);
  }
`;

const SummaryCard = styled.div<{ $gradient?: boolean }>`
  background: ${props => props.$gradient ? 
    'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%)' :
    theme.colors.gradient.card
  };
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  text-align: center;
  box-shadow: ${theme.shadows.soft};
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all ${theme.animation.transition.normal};
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${theme.colors.accent.deepLavender}, ${theme.colors.accent.softPink});
    opacity: 0.8;
  }
  
  &:hover {
    box-shadow: ${theme.shadows.hover};
    transform: translateY(-2px);
    
    &:before {
      opacity: 1;
    }
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
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('month');
  const [records, setRecords] = useState<MoodRecord[]>([]);
  const [customMoodsCount, setCustomMoodsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const allRecords = await UserMoodStorage.getAll(user.id);
      setRecords(allRecords);
    } catch (err) {
      console.error('加载记录失败:', err);
      setError('加载数据失败，请刷新页面重试');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const loadCustomMoodsCount = useCallback(async () => {
    if (!user) return;
    
    try {
      const customMoods = await UserCustomMoodStorage.getAll(user.id);
      setCustomMoodsCount(customMoods.length);
    } catch (err) {
      console.error('加载自定义心情数量失败:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadRecords();
      loadCustomMoodsCount();
    }
  }, [user, loadRecords, loadCustomMoodsCount]);

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
        streakDays: 0,
        highIntensityCount: 0,
        positiveRatio: 0,
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

    // 计算连续记录天数（从最近开始）
    const sortedRecords = [...filteredRecords].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    let streakDays = 0;
    const today = new Date();
    
    for (let i = 0; i < sortedRecords.length; i++) {
      const recordDate = new Date(sortedRecords[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      // 检查日期是否连续（允许1天的误差）
      const diffDays = Math.abs(expectedDate.getTime() - recordDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 1) {
        streakDays++;
      } else {
        break;
      }
    }

    // 计算高强度心情记录数（强度 >= 4）
    const highIntensityCount = filteredRecords.filter(record => record.intensity >= 4).length;

    // 计算积极情绪比例
    const positiveMoods = ['happy', 'excited', 'calm', 'peaceful'];
    const positiveCount = filteredRecords.filter(record => 
      positiveMoods.includes(record.mood.toLowerCase())
    ).length;
    const positiveRatio = filteredRecords.length > 0 ? 
      Math.round((positiveCount / filteredRecords.length) * 100) : 0;

    return {
      totalRecords: filteredRecords.length,
      avgIntensity,
      mostCommonMood,
      totalWords,
      streakDays,
      highIntensityCount,
      positiveRatio,
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

  const getUserJoinDate = () => {
    if (!user?.created_at) return '未知';
    const joinDate = new Date(user.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - joinDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 7) {
      return `${diffDays} 天前`;
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} 周前`;
    } else if (diffDays < 365) {
      return `${Math.floor(diffDays / 30)} 个月前`;
    } else {
      return `${Math.floor(diffDays / 365)} 年前`;
    }
  };

  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 6) return '深夜好';
    if (hour < 12) return '早上好';
    if (hour < 18) return '下午好';
    return '晚上好';
  };

  if (!user) {
    return (
      <Container>
        <ErrorContainer>
          <div style={{ fontSize: '3rem', marginBottom: theme.spacing.lg }}>🔐</div>
          <div>请先登录查看个人总结</div>
        </ErrorContainer>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <SimpleLoading
          type="content"
          size="medium"
          message="正在分析数据..."
        />
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
      {/* 用户信息区域 */}
      <UserInfoSection
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <UserAvatar $src={user.user_metadata?.avatar_url || user.user_metadata?.picture}>
          {!(user.user_metadata?.avatar_url || user.user_metadata?.picture) && 
            (user.user_metadata?.full_name || user.user_metadata?.name || '用户')
              .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
          }
        </UserAvatar>
        <UserDetails>
          <UserName>
            {user.user_metadata?.full_name || user.user_metadata?.name || '用户'}
          </UserName>
          <UserEmail>{user.email}</UserEmail>
          <UserStats>
            <UserStat>
              <UserStatValue>{summary.totalRecords}</UserStatValue>
              <UserStatLabel>心情记录</UserStatLabel>
            </UserStat>
            <UserStat>
              <UserStatValue>{customMoodsCount}</UserStatValue>
              <UserStatLabel>自定义心情</UserStatLabel>
            </UserStat>
            <UserStat>
              <UserStatValue>{getUserJoinDate()}</UserStatValue>
              <UserStatLabel>加入时间</UserStatLabel>
            </UserStat>
          </UserStats>
        </UserDetails>
      </UserInfoSection>

      {/* 欢迎信息 */}
      <WelcomeSection>
        <WelcomeTitle>
          <span>👋</span>
          {getWelcomeMessage()}，{user.user_metadata?.full_name?.split(' ')[0] || '朋友'}！
        </WelcomeTitle>
        <WelcomeMessage>
          很高兴看到你持续记录心情变化。通过数据分析，我们可以更好地了解你的情绪模式，帮助你保持心理健康。
        </WelcomeMessage>
      </WelcomeSection>

      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <HeaderContent>
          <Title>个人总结</Title>
          <Subtitle>深入了解你的情绪模式和变化趋势</Subtitle>
        </HeaderContent>
      </Header>

      <ContentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
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
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <SummaryCard>
            <SummaryIcon>📝</SummaryIcon>
            <SummaryValue>{summary.totalRecords}</SummaryValue>
            <SummaryLabel>记录数量</SummaryLabel>
            <SummaryDescription>
              {getTimeRangeText()}内的心情记录总数
            </SummaryDescription>
          </SummaryCard>
          
          <SummaryCard $gradient>
            <SummaryIcon>📊</SummaryIcon>
            <SummaryValue>{summary.avgIntensity}</SummaryValue>
            <SummaryLabel>平均强度</SummaryLabel>
            <SummaryDescription>
              情绪强度的平均值，范围 1-5
            </SummaryDescription>
          </SummaryCard>
          
          <SummaryCard>
            <SummaryIcon>😊</SummaryIcon>
            <SummaryValue>{summary.mostCommonMood}</SummaryValue>
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
          
          <SummaryCard $gradient>
            <SummaryIcon>🔥</SummaryIcon>
            <SummaryValue>{summary.streakDays}</SummaryValue>
            <SummaryLabel>连续记录天数</SummaryLabel>
            <SummaryDescription>
              从今天开始的连续记录天数
            </SummaryDescription>
          </SummaryCard>
          
          <SummaryCard>
            <SummaryIcon>⭐</SummaryIcon>
            <SummaryValue>{summary.highIntensityCount}</SummaryValue>
            <SummaryLabel>高强度记录</SummaryLabel>
            <SummaryDescription>
              强度≥4的心情记录数量
            </SummaryDescription>
          </SummaryCard>
          
          <SummaryCard $gradient>
            <SummaryIcon>💖</SummaryIcon>
            <SummaryValue>{summary.positiveRatio}%</SummaryValue>
            <SummaryLabel>积极情绪比例</SummaryLabel>
            <SummaryDescription>
              快乐、兴奋、平静等积极情绪占比
            </SummaryDescription>
          </SummaryCard>
          
          <SummaryCard>
            <SummaryIcon>🎨</SummaryIcon>
            <SummaryValue>{customMoodsCount}</SummaryValue>
            <SummaryLabel>自定义心情</SummaryLabel>
            <SummaryDescription>
              创建的个性化心情类型数量
            </SummaryDescription>
          </SummaryCard>
        </SummaryCards>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <MoodTrendChart records={filteredRecords} timeRange={timeRange} />
        </motion.div>

        <ChartGrid className="two-column">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <MoodDistributionChart records={filteredRecords} timeRange={timeRange} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <WordCloud records={filteredRecords} timeRange={timeRange} />
          </motion.div>
        </ChartGrid>
      </ContentContainer>
    </Container>
  );
};

export default AnalyticsPage;