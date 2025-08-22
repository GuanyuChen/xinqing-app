import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MoodRecord, MOOD_ICONS, MOOD_LABELS } from '../types/mood';
import { theme } from '../styles/theme';
import { ContentPlaceholders } from './SimpleLoading';

interface MoodListProps {
  records: MoodRecord[];
  isLoading?: boolean;
  onRecordClick?: (record: MoodRecord) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const Title = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const SortOptions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const SortButton = styled(motion.button)<{ $active: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${props => 
    props.$active ? theme.colors.accent.deepLavender : 'rgba(255, 255, 255, 0.7)'
  };
  color: ${props => 
    props.$active ? 'white' : theme.colors.text.secondary
  };
  border: 1px solid ${props => 
    props.$active ? theme.colors.accent.deepLavender : theme.colors.accent.warmGray
  };
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.typography.fontSize.xs};
  cursor: pointer;
  transition: all ${theme.animation.transition.normal};
  
  &:hover {
    background: ${props => 
      props.$active ? theme.colors.accent.deepLavender : theme.colors.accent.deepLavender + '20'
    };
    border-color: ${theme.colors.accent.deepLavender};
  }
`;

const RecordItem = styled(motion.div)`
  background: ${theme.colors.gradient.card};
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.medium};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.gentle};
  cursor: pointer;
  transition: all ${theme.animation.transition.normal};
  
  &:hover {
    box-shadow: ${theme.shadows.hover};
    transform: translateY(-2px);
  }
`;

const RecordHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const MoodIcon = styled.div<{ $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.$color}40;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
`;

const RecordMeta = styled.div`
  flex: 1;
`;

const RecordDate = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
`;

const RecordMood = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
`;

const IntensityBars = styled.div`
  display: flex;
  gap: 2px;
  margin-left: ${theme.spacing.sm};
`;

const IntensityBar = styled.div<{ $active: boolean; $color: string }>`
  width: 3px;
  height: 12px;
  background: ${props => 
    props.$active ? props.$color : theme.colors.accent.warmGray
  };
  border-radius: 1px;
  transition: background ${theme.animation.transition.normal};
`;

const RecordDiary = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.normal};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: ${theme.spacing.sm};
`;

const RecordMedia = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

const MediaIndicator = styled.div<{ $type: 'photo' | 'audio' }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${props => 
    props.$type === 'photo' ? theme.colors.mood.happy + '20' : theme.colors.mood.calm + '20'
  };
  color: ${props => 
    props.$type === 'photo' ? theme.colors.mood.happy : theme.colors.mood.calm
  };
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const EmptyState = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xxl};
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${theme.spacing.lg};
  opacity: 0.5;
`;

const EmptyText = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.sm};
`;

const EmptySubtext = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.light};
`;

type SortType = 'date-desc' | 'date-asc' | 'mood';

const MoodList: React.FC<MoodListProps> = ({
  records,
  isLoading = false,
  onRecordClick,
}) => {
  const [sortType, setSortType] = useState<SortType>('date-desc');

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

  const sortedRecords = [...records].sort((a, b) => {
    switch (sortType) {
      case 'date-desc':
        return b.date.localeCompare(a.date);
      case 'date-asc':
        return a.date.localeCompare(b.date);
      case 'mood':
        return a.mood.localeCompare(b.mood);
      default:
        return 0;
    }
  });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateStr === today.toISOString().split('T')[0]) {
      return '今天';
    } else if (dateStr === yesterday.toISOString().split('T')[0]) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', {
        month: 'short',
        day: 'numeric',
        weekday: 'short'
      });
    }
  };

  if (isLoading) {
    return (
      <Container>
        <ContentPlaceholders 
          count={3} 
          heights={['120px', '100px', '110px']}
        />
      </Container>
    );
  }

  if (records.length === 0) {
    return (
      <Container>
        <EmptyState
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <EmptyIcon>📝</EmptyIcon>
          <EmptyText>还没有心情记录</EmptyText>
          <EmptySubtext>开始记录你的第一个心情吧</EmptySubtext>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <ListHeader>
        <Title>历史记录 ({records.length})</Title>
        <SortOptions>
          <SortButton
            $active={sortType === 'date-desc'}
            onClick={() => setSortType('date-desc')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            最新
          </SortButton>
          <SortButton
            $active={sortType === 'date-asc'}
            onClick={() => setSortType('date-asc')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            最早
          </SortButton>
          <SortButton
            $active={sortType === 'mood'}
            onClick={() => setSortType('mood')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            心情
          </SortButton>
        </SortOptions>
      </ListHeader>

      <AnimatePresence>
        {sortedRecords.map((record, index) => (
          <RecordItem
            key={record.id}
            onClick={() => onRecordClick?.(record)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <RecordHeader>
              <MoodIcon $color={getMoodColor(record.mood)}>
                {MOOD_ICONS[record.mood]}
              </MoodIcon>
              <RecordMeta>
                <RecordDate>{formatDate(record.date)}</RecordDate>
                <RecordMood>
                  {MOOD_LABELS[record.mood]}
                  <IntensityBars>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <IntensityBar
                        key={level}
                        $active={level <= record.intensity}
                        $color={getMoodColor(record.mood)}
                      />
                    ))}
                  </IntensityBars>
                </RecordMood>
              </RecordMeta>
            </RecordHeader>

            {record.diary && (
              <RecordDiary>{record.diary}</RecordDiary>
            )}

            {(record.photo || record.audio) && (
              <RecordMedia>
                {record.photo && (
                  <MediaIndicator $type="photo">
                    📷 照片
                  </MediaIndicator>
                )}
                {record.audio && (
                  <MediaIndicator $type="audio">
                    🎵 录音
                  </MediaIndicator>
                )}
              </RecordMedia>
            )}
          </RecordItem>
        ))}
      </AnimatePresence>
    </Container>
  );
};

export default MoodList;