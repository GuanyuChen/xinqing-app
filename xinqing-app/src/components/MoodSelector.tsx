import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MoodType, MOOD_LABELS, MOOD_ICONS, MOOD_DESCRIPTIONS } from '../types/mood';
import { theme } from '../styles/theme';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onMoodSelect: (mood: MoodType) => void;
  disabled?: boolean;
}

const Container = styled.div`
  padding: ${theme.spacing.lg};
  
  @media (min-width: 769px) {
    padding: ${theme.spacing.xl};
  }
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.md};
  }
`;

const Title = styled.h2`
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.lg};
    margin-bottom: ${theme.spacing.sm};
  }
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  line-height: ${theme.typography.lineHeight.loose};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.xs};
    margin-bottom: ${theme.spacing.lg};
  }
`;

const MoodGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: ${theme.spacing.md};
  max-width: 600px;
  margin: 0 auto;
  
  @media (min-width: 769px) {
    grid-template-columns: repeat(4, 1fr);
    gap: ${theme.spacing.lg};
    max-width: 700px;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.sm};
    max-width: 100%;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${theme.spacing.xs};
  }
`;

const MoodCard = styled(motion.div)<{ $selected: boolean; $color: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing.lg};
  background: ${props => 
    props.$selected 
      ? `linear-gradient(135deg, ${props.$color}40 0%, ${props.$color}20 100%)`
      : 'rgba(255, 255, 255, 0.8)'
  };
  border: 2px solid ${props => props.$selected ? props.$color : 'transparent'};
  border-radius: ${theme.borderRadius.large};
  cursor: pointer;
  transition: all ${theme.animation.transition.normal};
  backdrop-filter: blur(10px);
  box-shadow: ${props => props.$selected ? theme.shadows.hover : theme.shadows.gentle};
  touch-action: manipulation;
  user-select: none;
  min-height: 120px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.hover};
    background: ${props => 
      props.$selected 
        ? `linear-gradient(135deg, ${props.$color}50 0%, ${props.$color}30 100%)`
        : 'rgba(255, 255, 255, 0.95)'
    };
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.md};
    min-height: 100px;
  }
  
  @media (max-width: 480px) {
    padding: ${theme.spacing.sm};
    min-height: 90px;
  }
`;

const MoodIcon = styled.div<{ $selected: boolean }>`
  font-size: 2.5rem;
  margin-bottom: ${theme.spacing.sm};
  filter: ${props => props.$selected ? 'none' : 'grayscale(0.3)'};
  transition: filter ${theme.animation.transition.normal};
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: ${theme.spacing.xs};
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const MoodLabel = styled.div<{ $selected: boolean }>`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${props => props.$selected ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.xs};
  transition: font-weight ${theme.animation.transition.normal};
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.sm};
    margin-bottom: 2px;
  }
`;

const MoodDescription = styled.div<{ $selected: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.secondary};
  text-align: center;
  line-height: ${theme.typography.lineHeight.normal};
  opacity: ${props => props.$selected ? 1 : 0.7};
  transition: opacity ${theme.animation.transition.normal};
  
  @media (max-width: 768px) {
    font-size: 10px;
    line-height: 1.3;
  }
  
  @media (max-width: 480px) {
    display: none; /* 在小屏幕上隐藏描述 */
  }
`;

const SelectionFeedback = styled(motion.div)`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${theme.colors.gradient.card};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.hover};
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1000;
`;

const FeedbackIcon = styled.div`
  font-size: 4rem;
  margin-bottom: ${theme.spacing.md};
`;

const FeedbackText = styled.div`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  text-align: center;
`;

const moods: { type: MoodType; color: string }[] = [
  { type: 'happy', color: theme.colors.mood.happy },
  { type: 'calm', color: theme.colors.mood.calm },
  { type: 'excited', color: theme.colors.mood.excited },
  { type: 'peaceful', color: theme.colors.mood.peaceful },
  { type: 'sad', color: theme.colors.mood.sad },
  { type: 'anxious', color: theme.colors.mood.anxious },
  { type: 'angry', color: theme.colors.mood.angry },
  { type: 'tired', color: theme.colors.mood.tired },
];

const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
  disabled = false,
}) => {
  const [showFeedback, setShowFeedback] = useState<MoodType | null>(null);

  const handleMoodSelect = useCallback((mood: MoodType) => {
    if (disabled) return;
    
    onMoodSelect(mood);
    setShowFeedback(mood);
    
    // 隐藏反馈
    setTimeout(() => {
      setShowFeedback(null);
    }, 1500);
  }, [onMoodSelect, disabled]);

  return (
    <Container>
      <Title>今天的心情如何？</Title>
      <Subtitle>选择最能代表你现在感受的情绪</Subtitle>
      
      <MoodGrid>
        {moods.map(({ type, color }) => (
          <MoodCard
            key={type}
            $selected={selectedMood === type}
            $color={color}
            onClick={() => handleMoodSelect(type)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3, 
              delay: moods.findIndex(m => m.type === type) * 0.05 
            }}
          >
            <MoodIcon $selected={selectedMood === type}>
              {MOOD_ICONS[type]}
            </MoodIcon>
            <MoodLabel $selected={selectedMood === type}>
              {MOOD_LABELS[type]}
            </MoodLabel>
            <MoodDescription $selected={selectedMood === type}>
              {MOOD_DESCRIPTIONS[type]}
            </MoodDescription>
          </MoodCard>
        ))}
      </MoodGrid>

      <AnimatePresence>
        {showFeedback && (
          <SelectionFeedback
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <FeedbackIcon>{MOOD_ICONS[showFeedback]}</FeedbackIcon>
            <FeedbackText>
              选择了 {MOOD_LABELS[showFeedback]}
            </FeedbackText>
          </SelectionFeedback>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default MoodSelector;