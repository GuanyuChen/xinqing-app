import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../styles/theme';

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
  background: linear-gradient(135deg, ${theme.colors.text.primary} 0%, #FF69B4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.lg};
`;

const ContentContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  
  @media (min-width: 769px) {
    max-width: 900px;
  }
`;

const CycleCard = styled.div`
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.soft};
  margin-bottom: ${theme.spacing.xl};
`;

const CycleHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const CycleStatus = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const StatusIcon = styled.div`
  font-size: 2.5rem;
`;

const StatusInfo = styled.div``;

const StatusTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin: 0;
`;

const StatusSubtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin: ${theme.spacing.xs} 0 0 0;
`;

const QuickActions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const ActionButton = styled(motion.button)`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.accent.deepLavender};
  color: white;
  border: none;
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.transition.normal};
  
  &:hover {
    background: ${theme.colors.accent.deepLavender}dd;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: ${theme.colors.accent.warmGray};
    cursor: not-allowed;
    transform: none;
  }
`;

const CycleVisualization = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: ${theme.spacing.xl} 0;
`;

const CircularProgress = styled.div`
  position: relative;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #FF69B4 0deg 90deg,
    #FFB6C1 90deg 180deg,
    #DDA0DD 180deg 270deg,
    #E6E6FA 270deg 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CircularInner = styled.div`
  width: 150px;
  height: 150px;
  background: white;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: ${theme.shadows.gentle};
`;

const DaysCount = styled.div`
  font-size: ${theme.typography.fontSize.xxl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
`;

const DaysLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-top: ${theme.spacing.xs};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${theme.spacing.lg};
  margin: ${theme.spacing.xl} 0;
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

const HistorySection = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.soft};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.lg};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const PeriodRecordItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  background: rgba(255, 255, 255, 0.5);
  margin-bottom: ${theme.spacing.md};
  transition: all ${theme.animation.transition.normal};
  
  &:hover {
    background: rgba(255, 255, 255, 0.8);
    transform: translateY(-1px);
  }
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const RecordDate = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
`;

const RecordInfo = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

interface PeriodRecordType {
  id: string;
  startDate: string;
  endDate?: string;
  length?: number;
  cycleLength?: number;
}

const PeriodPage: React.FC = () => {
  const [lastPeriod, setLastPeriod] = useState<Date | null>(null);
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [records, setRecords] = useState<PeriodRecordType[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // 从本地存储加载数据
    const savedData = localStorage.getItem('period-data');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.lastPeriod) {
        setLastPeriod(new Date(data.lastPeriod));
      }
      setCycleLength(data.cycleLength || 28);
      setPeriodLength(data.periodLength || 5);
      setRecords(data.records || []);
      setIsTracking(data.isTracking || false);
    }
  }, []);

  const saveData = (data: any) => {
    localStorage.setItem('period-data', JSON.stringify(data));
  };

  const startPeriod = () => {
    const today = new Date();
    const newRecord: PeriodRecordType = {
      id: Date.now().toString(),
      startDate: today.toISOString().split('T')[0],
    };
    
    const updatedRecords = [newRecord, ...records];
    const newData = {
      lastPeriod: today,
      cycleLength,
      periodLength,
      records: updatedRecords,
      isTracking: true,
    };
    
    setLastPeriod(today);
    setRecords(updatedRecords);
    setIsTracking(true);
    saveData(newData);
  };

  const endPeriod = () => {
    if (records.length > 0) {
      const today = new Date();
      const currentRecord = records[0];
      const startDate = new Date(currentRecord.startDate);
      const length = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const updatedRecord = {
        ...currentRecord,
        endDate: today.toISOString().split('T')[0],
        length,
      };
      
      const updatedRecords = [updatedRecord, ...records.slice(1)];
      const newData = {
        lastPeriod,
        cycleLength,
        periodLength,
        records: updatedRecords,
        isTracking: false,
      };
      
      setRecords(updatedRecords);
      setIsTracking(false);
      saveData(newData);
    }
  };

  const getDaysUntilNext = () => {
    if (!lastPeriod) return 0;
    const today = new Date();
    const nextPeriod = new Date(lastPeriod.getTime() + cycleLength * 24 * 60 * 60 * 1000);
    const diffTime = nextPeriod.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getPhaseInfo = () => {
    const daysUntilNext = getDaysUntilNext();
    const cycleProgress = ((cycleLength - daysUntilNext) / cycleLength) * 100;
    
    if (isTracking) {
      return {
        phase: '月经期',
        icon: '🌸',
        description: '正在记录中',
        progress: cycleProgress,
      };
    }
    
    if (daysUntilNext <= 3) {
      return {
        phase: '经前期',
        icon: '🌙',
        description: `预计 ${daysUntilNext} 天后开始`,
        progress: cycleProgress,
      };
    }
    
    if (daysUntilNext > cycleLength / 2) {
      return {
        phase: '卵泡期',
        icon: '🌱',
        description: `距离下次还有 ${daysUntilNext} 天`,
        progress: cycleProgress,
      };
    }
    
    return {
      phase: '黄体期',
      icon: '🌻',
      description: `距离下次还有 ${daysUntilNext} 天`,
      progress: cycleProgress,
    };
  };

  const getAverageLength = () => {
    const completedRecords = records.filter(r => r.length);
    if (completedRecords.length === 0) return periodLength;
    return Math.round(completedRecords.reduce((sum, r) => sum + (r.length || 0), 0) / completedRecords.length);
  };

  const phaseInfo = getPhaseInfo();
  const daysUntilNext = getDaysUntilNext();

  return (
    <Container>
      <Header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Title>月经周期</Title>
        <Subtitle>记录和追踪你的月经周期，关爱女性健康</Subtitle>
      </Header>

      <ContentContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <CycleCard>
          <CycleHeader>
            <CycleStatus>
              <StatusIcon>{phaseInfo.icon}</StatusIcon>
              <StatusInfo>
                <StatusTitle>{phaseInfo.phase}</StatusTitle>
                <StatusSubtitle>{phaseInfo.description}</StatusSubtitle>
              </StatusInfo>
            </CycleStatus>
            <QuickActions>
              {!isTracking ? (
                <ActionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startPeriod}
                >
                  开始记录
                </ActionButton>
              ) : (
                <ActionButton
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={endPeriod}
                >
                  结束记录
                </ActionButton>
              )}
            </QuickActions>
          </CycleHeader>

          <CycleVisualization>
            <CircularProgress>
              <CircularInner>
                <DaysCount>{daysUntilNext}</DaysCount>
                <DaysLabel>天后</DaysLabel>
              </CircularInner>
            </CircularProgress>
          </CycleVisualization>

          <StatsGrid>
            <StatCard>
              <StatValue>{cycleLength}</StatValue>
              <StatLabel>周期长度</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{getAverageLength()}</StatValue>
              <StatLabel>平均经期</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{records.length}</StatValue>
              <StatLabel>记录次数</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{Math.round(phaseInfo.progress)}%</StatValue>
              <StatLabel>周期进度</StatLabel>
            </StatCard>
          </StatsGrid>
        </CycleCard>

        <HistorySection>
          <SectionTitle>
            <span>📋</span>
            历史记录
          </SectionTitle>
          {records.length > 0 ? (
            records.map((record) => (
              <PeriodRecordItem key={record.id}>
                <div>
                  <RecordDate>
                    {new Date(record.startDate).toLocaleDateString()}
                    {record.endDate && ` - ${new Date(record.endDate).toLocaleDateString()}`}
                  </RecordDate>
                  <RecordInfo>
                    {record.length ? `持续 ${record.length} 天` : '记录中...'}
                  </RecordInfo>
                </div>
              </PeriodRecordItem>
            ))
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: theme.spacing.xl,
              color: theme.colors.text.secondary 
            }}>
              暂无记录，开始记录你的第一个周期吧！
            </div>
          )}
        </HistorySection>
      </ContentContainer>
    </Container>
  );
};

export default PeriodPage;