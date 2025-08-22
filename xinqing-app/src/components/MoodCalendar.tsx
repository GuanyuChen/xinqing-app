import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Calendar from 'react-calendar';
import { motion, AnimatePresence } from 'framer-motion';
import { MoodRecord, MOOD_ICONS, MOOD_LABELS } from '../types/mood';
import { theme } from '../styles/theme';
import 'react-calendar/dist/Calendar.css';

interface MoodCalendarProps {
  records: MoodRecord[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  isLoading?: boolean;
}

const CalendarContainer = styled.div`
  .react-calendar {
    width: 100%;
    max-width: 100%;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border: none;
    border-radius: ${theme.borderRadius.medium};
    box-shadow: ${theme.shadows.gentle};
    font-family: ${theme.typography.fontFamily.primary};
    overflow: hidden;
  }

  .react-calendar--selectRange .react-calendar__tile--hover {
    background-color: ${theme.colors.accent.deepLavender}30;
  }

  .react-calendar__navigation {
    display: flex;
    height: 64px;
    margin-bottom: 0;
    background: ${theme.colors.gradient.soft};
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  }

  .react-calendar__navigation button {
    min-width: 44px;
    background: none;
    border: none;
    color: ${theme.colors.text.primary};
    font-size: ${theme.typography.fontSize.lg};
    font-weight: ${theme.typography.fontWeight.medium};
    cursor: pointer;
    transition: all ${theme.animation.transition.normal};
    border-radius: ${theme.borderRadius.small};
    margin: ${theme.spacing.xs};
    
    &:hover {
      background: ${theme.colors.accent.deepLavender}20;
      color: ${theme.colors.accent.deepLavender};
    }
    
    &:disabled {
      background: none;
      color: ${theme.colors.text.light};
      cursor: not-allowed;
    }
  }

  .react-calendar__navigation__label {
    font-weight: ${theme.typography.fontWeight.semibold};
    font-size: ${theme.typography.fontSize.lg};
    flex: 1;
  }

  .react-calendar__month-view__weekdays {
    text-align: center;
    text-transform: uppercase;
    font-weight: ${theme.typography.fontWeight.medium};
    font-size: ${theme.typography.fontSize.xs};
    color: ${theme.colors.text.secondary};
    background: rgba(255, 255, 255, 0.5);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    
    .react-calendar__month-view__weekdays__weekday {
      padding: ${theme.spacing.md};
      
      abbr {
        text-decoration: none;
      }
    }
  }

  .react-calendar__month-view__days__day {
    position: relative;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${theme.typography.fontSize.sm};
    font-weight: ${theme.typography.fontWeight.medium};
    color: ${theme.colors.text.primary};
    background: none;
    border: none;
    cursor: pointer;
    transition: all ${theme.animation.transition.normal};
    border-radius: 0;
    
    &:hover {
      background: ${theme.colors.accent.deepLavender}15;
    }
    
    &.react-calendar__tile--active {
      background: ${theme.colors.accent.deepLavender}40 !important;
      color: ${theme.colors.text.primary} !important;
      font-weight: ${theme.typography.fontWeight.semibold};
    }
  }

  .react-calendar__month-view__days__day--neighboringMonth {
    color: ${theme.colors.text.light};
  }

  .react-calendar__tile--now {
    background: ${theme.colors.mood.happy}30;
    
    &:hover {
      background: ${theme.colors.mood.happy}40;
    }
  }
`;

const MoodIndicator = styled.div<{ $mood: string; $color: string }>`
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  z-index: 1;
`;

const MoodEmoji = styled.span`
  font-size: 10px;
  line-height: 1;
`;

const CalendarLegend = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  justify-content: center;
  margin-top: ${theme.spacing.lg};
  padding: ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(5px);
  border-radius: ${theme.borderRadius.medium};
`;

const LegendItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${props => props.$color}20;
  border-radius: ${theme.borderRadius.small};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  
  .mood-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.$color};
  }
`;

const SelectedDateInfo = styled(motion.div)`
  margin-top: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  background: ${theme.colors.gradient.card};
  backdrop-filter: blur(10px);
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.gentle};
  text-align: center;
`;

const DateTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const NoRecordMessage = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.light};
  font-style: italic;
`;

const MoodSummary = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const MoodIcon = styled.div`
  font-size: 2rem;
`;

const MoodDetails = styled.div`
  text-align: left;
`;

const MoodName = styled.div`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
`;

const MoodIntensity = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
`;

const DiaryPreview = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  line-height: ${theme.typography.lineHeight.normal};
  text-align: left;
  background: rgba(255, 255, 255, 0.5);
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.small};
  max-height: 80px;
  overflow: hidden;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 20px;
    background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.5));
  }
`;

const MoodCalendar: React.FC<MoodCalendarProps> = ({
  records,
  selectedDate,
  onDateSelect,
  isLoading = false,
}) => {
  const [recordsMap, setRecordsMap] = useState<Map<string, MoodRecord>>(new Map());
  const [legendMoods, setLegendMoods] = useState<Set<string>>(new Set());

  useEffect(() => {
    const map = new Map<string, MoodRecord>();
    const moods = new Set<string>();
    
    records.forEach(record => {
      map.set(record.date, record);
      moods.add(record.mood);
    });
    
    setRecordsMap(map);
    setLegendMoods(moods);
  }, [records]);

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

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateStr = date.toISOString().split('T')[0];
      const record = recordsMap.get(dateStr);
      
      if (record) {
        return (
          <MoodIndicator $mood={record.mood} $color={getMoodColor(record.mood)}>
            <MoodEmoji>{MOOD_ICONS[record.mood]}</MoodEmoji>
          </MoodIndicator>
        );
      }
    }
    return null;
  };

  const formatSelectedDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getSelectedRecord = () => {
    if (!selectedDate) return null;
    const dateStr = selectedDate.toISOString().split('T')[0];
    return recordsMap.get(dateStr);
  };

  return (
    <div>
      <CalendarContainer>
        <Calendar
          onChange={(date) => onDateSelect(date as Date)}
          value={selectedDate}
          tileContent={tileContent}
          locale="zh-CN"
          prev2Label={null}
          next2Label={null}
          showNeighboringMonth={false}
          maxDate={new Date()}
        />
      </CalendarContainer>

      {legendMoods.size > 0 && (
        <CalendarLegend
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {Array.from(legendMoods).map(mood => (
            <LegendItem key={mood} $color={getMoodColor(mood)}>
              <div className="mood-dot" />
              <span>{MOOD_LABELS[mood as keyof typeof MOOD_LABELS]}</span>
            </LegendItem>
          ))}
        </CalendarLegend>
      )}

      <AnimatePresence>
        {selectedDate && (
          <SelectedDateInfo
            key={selectedDate.toISOString()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <DateTitle>{formatSelectedDate(selectedDate)}</DateTitle>
            
            {(() => {
              const record = getSelectedRecord();
              if (record) {
                return (
                  <div>
                    <MoodSummary>
                      <MoodIcon>{MOOD_ICONS[record.mood]}</MoodIcon>
                      <MoodDetails>
                        <MoodName>{MOOD_LABELS[record.mood]}</MoodName>
                        <MoodIntensity>强度: {record.intensity}/5</MoodIntensity>
                      </MoodDetails>
                    </MoodSummary>
                    
                    {record.diary && (
                      <DiaryPreview>
                        {record.diary}
                      </DiaryPreview>
                    )}
                  </div>
                );
              } else {
                return (
                  <NoRecordMessage>
                    这一天还没有记录心情
                  </NoRecordMessage>
                );
              }
            })()}
          </SelectedDateInfo>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MoodCalendar;