import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { MoodType, MoodRecord } from '../types/mood';
import { theme } from '../styles/theme';
import MoodSelector from '../components/MoodSelector';
import IntensitySelector from '../components/IntensitySelector';
import DiaryInput from '../components/DiaryInput';
import MediaUpload from '../components/MediaUpload';
import HybridMoodStorage from '../utils/hybridStorage';

const Container = styled.div`
  min-height: 100vh;
  padding: ${theme.spacing.lg};
  background: ${theme.colors.gradient.primary};
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.md};
    min-height: calc(100vh - 80px); /* 为底部导航留空间 */
  }
`;

const Header = styled(motion.div)`
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
  
  @media (max-width: 768px) {
    margin-bottom: ${theme.spacing.lg};
  }
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
  
  @media (max-width: 480px) {
    font-size: ${theme.typography.fontSize.xl};
  }
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.md};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.base};
    margin-bottom: ${theme.spacing.sm};
  }
`;

const DateDisplay = styled.div`
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.light};
  font-weight: ${theme.typography.fontWeight.medium};
  
  @media (max-width: 768px) {
    font-size: ${theme.typography.fontSize.sm};
  }
`;

const FormContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  background: ${theme.colors.gradient.card};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  box-shadow: ${theme.shadows.soft};
  overflow: hidden;
  
  @media (max-width: 768px) {
    max-width: 100%;
    border-radius: ${theme.borderRadius.medium};
    margin: 0 ${theme.spacing.xs};
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  padding: ${theme.spacing.lg};
  background: rgba(255, 255, 255, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
`;

const Step = styled(motion.div)<{ $active: boolean; $completed: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin: 0 ${theme.spacing.sm};
  background: ${props => 
    props.$completed ? theme.colors.accent.deepLavender :
    props.$active ? theme.colors.accent.softBlue :
    theme.colors.accent.warmGray
  };
  transition: background ${theme.animation.transition.normal};
`;

const StepContent = styled(motion.div)`
  min-height: 400px;
`;

const Navigation = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.lg};
  background: rgba(255, 255, 255, 0.3);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
`;

const NavButton = styled(motion.button)<{ $variant: 'primary' | 'secondary' }>`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.transition.normal};
  
  ${props => props.$variant === 'primary' ? `
    background: ${theme.colors.accent.deepLavender};
    color: white;
    
    &:hover {
      background: ${theme.colors.accent.softBlue};
      transform: translateY(-1px);
      box-shadow: ${theme.shadows.hover};
    }
    
    &:disabled {
      background: ${theme.colors.accent.warmGray};
      cursor: not-allowed;
      transform: none;
    }
  ` : `
    background: transparent;
    color: ${theme.colors.text.secondary};
    border: 1px solid ${theme.colors.accent.warmGray};
    
    &:hover {
      background: rgba(255, 255, 255, 0.5);
      border-color: ${theme.colors.accent.deepLavender};
    }
  `}
`;

const SaveStatus = styled(motion.div)<{ $status: 'saving' | 'saved' | 'error' }>`
  position: fixed;
  bottom: ${theme.spacing.lg};
  right: ${theme.spacing.lg};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${props => {
    switch (props.$status) {
      case 'saving': return theme.colors.mood.anxious;
      case 'saved': return theme.colors.mood.calm;
      case 'error': return theme.colors.mood.angry;
      default: return theme.colors.accent.warmGray;
    }
  }};
  color: white;
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.hover};
  font-size: ${theme.typography.fontSize.sm};
  z-index: 1000;
`;

const steps = ['情绪', '强度', '记录', '媒体'];

const TodayMoodRecord: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [intensity, setIntensity] = useState(3);
  const [diary, setDiary] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();
  const [audio, setAudio] = useState<string | undefined>();
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [storage] = useState(() => new HybridMoodStorage());

  const today = new Date().toISOString().split('T')[0];
  const todayFormatted = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  useEffect(() => {
    loadTodayRecord();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadTodayRecord = async () => {
    try {
      const existingRecord = await storage.getByDate(today);
      if (existingRecord) {
        setSelectedMood(existingRecord.mood);
        setIntensity(existingRecord.intensity);
        setDiary(existingRecord.diary);
        setPhoto(existingRecord.photo);
        setAudio(existingRecord.audio);
      }
    } catch (error) {
      console.error('加载今日记录失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveRecord = async () => {
    if (!selectedMood) return;

    try {
      setSaveStatus('saving');
      
      const recordData: Omit<MoodRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        date: today,
        mood: selectedMood,
        intensity,
        diary: diary.trim(),
        photo,
        audio,
        tags: [], // 可以后续添加标签功能
      };

      await storage.save(recordData);
      setSaveStatus('saved');
      
      setTimeout(() => {
        setSaveStatus(null);
      }, 2000);
    } catch (error) {
      console.error('保存记录失败:', error);
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      saveRecord();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedMood !== null;
      case 1: return true; // 强度有默认值
      case 2: return diary.trim().length > 0;
      case 3: return true; // 媒体是可选的
      default: return false;
    }
  };

  const getStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <MoodSelector
            selectedMood={selectedMood}
            onMoodSelect={setSelectedMood}
            disabled={isLoading}
          />
        );
      case 1:
        return (
          <IntensitySelector
            intensity={intensity}
            onIntensityChange={setIntensity}
            disabled={isLoading}
          />
        );
      case 2:
        return (
          <DiaryInput
            diary={diary}
            onDiaryChange={setDiary}
            disabled={isLoading}
          />
        );
      case 3:
        return (
          <MediaUpload
            photo={photo}
            audio={audio}
            onPhotoChange={setPhoto}
            onAudioChange={setAudio}
            disabled={isLoading}
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Container>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.text.secondary
        }}>
          正在加载...
        </div>
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
        <Title>心情记录</Title>
        <Subtitle>记录此刻的感受，与内心对话</Subtitle>
        <DateDisplay>{todayFormatted}</DateDisplay>
      </Header>

      <FormContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <StepIndicator>
          {steps.map((_, index) => (
            <Step
              key={index}
              $active={index === currentStep}
              $completed={index < currentStep || (index === 0 && selectedMood !== null)}
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
          ))}
        </StepIndicator>

        <AnimatePresence mode="wait">
          <StepContent
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {getStepContent()}
          </StepContent>
        </AnimatePresence>

        <Navigation>
          <NavButton
            $variant="secondary"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{ visibility: currentStep === 0 ? 'hidden' : 'visible' }}
          >
            上一步
          </NavButton>

          <NavButton
            $variant="primary"
            onClick={handleNext}
            disabled={!canProceed()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {currentStep === steps.length - 1 ? '保存记录' : '下一步'}
          </NavButton>
        </Navigation>
      </FormContainer>

      <AnimatePresence>
        {saveStatus && (
          <SaveStatus
            $status={saveStatus}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            {saveStatus === 'saving' && '正在保存...'}
            {saveStatus === 'saved' && '保存成功！'}
            {saveStatus === 'error' && '保存失败，请重试'}
          </SaveStatus>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default TodayMoodRecord;