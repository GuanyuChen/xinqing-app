import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MoodType, CustomMood } from '../types/mood';
import { theme } from '../styles/theme';
import CustomMoodStorage from '../utils/customMoodStorage';
import CustomMoodCreator from './CustomMoodCreator';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onMoodSelect: (mood: MoodType) => void;
  disabled?: boolean;
  userId?: string;
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

const FeedbackOverlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  pointer-events: none;
`;

const SelectionFeedback = styled(motion.div)`
  background: ${theme.colors.gradient.card};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.hover};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 200px;
  max-width: 300px;
  text-align: center;
  pointer-events: auto;
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.lg};
    min-width: 180px;
    max-width: 250px;
  }
  
  @media (max-width: 480px) {
    padding: ${theme.spacing.md};
    min-width: 160px;
    max-width: 200px;
  }
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

const AddMoodCard = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 2px dashed rgba(255, 255, 255, 0.3);
  border-radius: ${theme.borderRadius.large};
  cursor: pointer;
  transition: all ${theme.animation.transition.normal};
  min-height: 120px;
  
  &:hover {
    border-color: ${theme.colors.accent.deepLavender};
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%);
    transform: translateY(-2px);
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

const AddMoodIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.text.secondary};
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: ${theme.spacing.xs};
  }
  
  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

const AddMoodText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  font-weight: ${theme.typography.fontWeight.medium};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.xs};
  }
`;

const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodSelect,
  disabled = false,
  userId,
}) => {
  const [showFeedback, setShowFeedback] = useState<MoodType | null>(null);
  const [allMoods, setAllMoods] = useState<CustomMood[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadAllMoods = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 正在加载所有心情...');
      
      // 从 Supabase 获取所有心情（包括预置心情和用户自定义心情）
      const moods = await CustomMoodStorage.getAll(userId);
      
      console.log(`✅ 成功加载 ${moods.length} 个心情`);
      setAllMoods(moods);
    } catch (error) {
      console.error('加载心情失败:', error);
      // 如果加载失败，使用本地预置心情作为后备
      const fallbackMoods: CustomMood[] = [
        { id: 'happy', name: 'happy', icon: '😊', color: '#FFD93D', description: '感到快乐和满足', createdAt: new Date() },
        { id: 'sad', name: 'sad', icon: '😢', color: '#74B9FF', description: '感到悲伤或沮丧', createdAt: new Date() },
        { id: 'anxious', name: 'anxious', icon: '😰', color: '#FD79A8', description: '感到紧张或担心', createdAt: new Date() },
        { id: 'calm', name: 'calm', icon: '😌', color: '#6C5CE7', description: '感到平静和放松', createdAt: new Date() },
        { id: 'angry', name: 'angry', icon: '😡', color: '#E84393', description: '感到愤怒或烦躁', createdAt: new Date() },
        { id: 'excited', name: 'excited', icon: '🤩', color: '#00B894', description: '感到兴奋或激动', createdAt: new Date() },
        { id: 'tired', name: 'tired', icon: '😴', color: '#636E72', description: '感到疲惫或倦怠', createdAt: new Date() },
        { id: 'peaceful', name: 'peaceful', icon: '🧘‍♀️', color: '#00CEC9', description: '感到内心宁静', createdAt: new Date() }
      ];
      setAllMoods(fallbackMoods);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAllMoods();
  }, [loadAllMoods]);

  const handleCustomMoodSave = async (moodData: { name: string; icon: string; color: string; description: string }) => {
    try {
      const savedMood = await CustomMoodStorage.save(moodData, userId);
      
      if (savedMood) {
        // 重新加载所有心情以获取最新数据
        await loadAllMoods();
        setShowCreator(false);
        
        // 自动选择新创建的心情
        handleMoodSelect(savedMood.name);
      }
    } catch (error) {
      console.error('保存自定义心情失败:', error);
    }
  };

  const handleMoodSelect = useCallback((mood: MoodType) => {
    if (disabled) return;
    
    onMoodSelect(mood);
    setShowFeedback(mood);
    
    setTimeout(() => {
      setShowFeedback(null);
    }, 1500);
  }, [onMoodSelect, disabled]);

  const getMoodDisplay = (mood: MoodType) => {
    // 从所有心情中查找匹配的心情
    const foundMood = allMoods.find(m => m.name === mood);
    
    if (foundMood) {
      return {
        label: foundMood.name,
        icon: foundMood.icon,
        description: foundMood.description
      };
    }
    
    // 如果没有找到，返回默认显示
    return {
      label: mood as string,
      icon: '❓',
      description: '未知心情'
    };
  };

  // 显示加载状态
  if (loading) {
    return (
      <Container>
        <Title>正在加载心情...</Title>
        <Subtitle>请稍候</Subtitle>
      </Container>
    );
  }

  return (
    <Container>
      <Title>今天的心情如何？</Title>
      <Subtitle>选择最能代表你现在感受的情绪</Subtitle>
      
      <MoodGrid>
        {allMoods.map((mood, index) => {
          const display = getMoodDisplay(mood.name);
          return (
            <MoodCard
              key={mood.id}
              $selected={selectedMood === mood.name}
              $color={mood.color}
              onClick={() => handleMoodSelect(mood.name)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05 
              }}
            >
              <MoodIcon $selected={selectedMood === mood.name}>
                {display.icon}
              </MoodIcon>
              <MoodLabel $selected={selectedMood === mood.name}>
                {display.label}
              </MoodLabel>
              <MoodDescription $selected={selectedMood === mood.name}>
                {display.description}
              </MoodDescription>
            </MoodCard>
          );
        })}
        
        <AddMoodCard
          onClick={() => setShowCreator(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3, 
            delay: allMoods.length * 0.05 
          }}
        >
          <AddMoodIcon>+</AddMoodIcon>
          <AddMoodText>添加自定义心情</AddMoodText>
        </AddMoodCard>
      </MoodGrid>

      <CustomMoodCreator
        isOpen={showCreator}
        onClose={() => setShowCreator(false)}
        onSave={handleCustomMoodSave}
      />

      <AnimatePresence>
        {showFeedback && (
          <FeedbackOverlay
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SelectionFeedback
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <FeedbackIcon>{getMoodDisplay(showFeedback).icon}</FeedbackIcon>
              <FeedbackText>
                选择了 {getMoodDisplay(showFeedback).label}
              </FeedbackText>
            </SelectionFeedback>
          </FeedbackOverlay>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default MoodSelector;