import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../styles/theme';

interface DiaryInputProps {
  diary: string;
  onDiaryChange: (diary: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const Container = styled.div`
  padding: ${theme.spacing.lg};
  
  @media (min-width: 769px) {
    padding: ${theme.spacing.xl};
  }
`;

const Title = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const Description = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.lg};
  line-height: ${theme.typography.lineHeight.normal};
`;

const TextareaContainer = styled.div`
  position: relative;
  margin-bottom: ${theme.spacing.md};
`;

const StyledTextarea = styled.textarea<{ $hasContent: boolean }>`
  width: 100%;
  min-height: 120px;
  padding: ${theme.spacing.lg};
  border: 2px solid transparent;
  border-radius: ${theme.borderRadius.medium};
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  font-family: ${theme.typography.fontFamily.primary};
  font-size: ${theme.typography.fontSize.base};
  color: ${theme.colors.text.primary};
  line-height: ${theme.typography.lineHeight.loose};
  resize: vertical;
  transition: all ${theme.animation.transition.normal};
  box-shadow: ${theme.shadows.gentle};
  
  @media (min-width: 769px) {
    min-height: 160px;
    font-size: ${theme.typography.fontSize.base};
  }
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.accent.deepLavender};
    background: rgba(255, 255, 255, 0.95);
    box-shadow: ${theme.shadows.hover};
  }
  
  &::placeholder {
    color: ${theme.colors.text.light};
    font-style: italic;
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.6);
    color: ${theme.colors.text.light};
    cursor: not-allowed;
  }
`;

const WordCount = styled(motion.div)<{ $isNearLimit: boolean }>`
  position: absolute;
  bottom: ${theme.spacing.sm};
  right: ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.xs};
  color: ${props => 
    props.$isNearLimit ? theme.colors.mood.anxious : theme.colors.text.light
  };
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.small};
  pointer-events: none;
`;

const PromptSuggestions = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
`;

const PromptChip = styled(motion.button)`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid ${theme.colors.accent.warmGray};
  border-radius: ${theme.borderRadius.large};
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  cursor: pointer;
  transition: all ${theme.animation.transition.normal};
  backdrop-filter: blur(5px);
  
  &:hover {
    background: ${theme.colors.accent.deepLavender};
    color: ${theme.colors.text.white};
    border-color: ${theme.colors.accent.deepLavender};
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const Characteristics = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.light};
`;

const Characteristic = styled(motion.div)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  background: ${props => 
    props.$isActive 
      ? `${theme.colors.accent.deepLavender}20` 
      : 'rgba(255, 255, 255, 0.5)'
  };
  border-radius: ${theme.borderRadius.small};
  transition: all ${theme.animation.transition.normal};
`;

const CharacteristicIcon = styled.span`
  margin-right: ${theme.spacing.xs};
`;

const prompts = [
  '发生了什么特别的事？',
  '是什么触发了这种感受？',
  '我现在最需要什么？',
  '今天学到了什么？',
  '我想感谢什么？',
  '明天我想如何改善？',
];

const MAX_CHARACTERS = 500;

const DiaryInput: React.FC<DiaryInputProps> = ({
  diary,
  onDiaryChange,
  placeholder = '写下今天的想法和感受...',
  disabled = false,
}) => {
  const [showPrompts, setShowPrompts] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const wordCount = diary.length;
  const isNearLimit = wordCount > MAX_CHARACTERS * 0.8;
  const isOverLimit = wordCount > MAX_CHARACTERS;

  // 分析日记内容特征
  const characteristics = [
    { 
      icon: '📝', 
      label: `${diary.split(/\s+/).filter(word => word.length > 0).length} 个词`,
      active: diary.trim().length > 0 
    },
    { 
      icon: '💭', 
      label: diary.includes('我觉得') || diary.includes('我认为') ? '有观点表达' : '可以加入想法',
      active: diary.includes('我觉得') || diary.includes('我认为')
    },
    { 
      icon: '❤️', 
      label: /[高兴|开心|快乐|幸福|满足]/.test(diary) ? '积极情绪' : '情绪表达',
      active: /[高兴|开心|快乐|幸福|满足]/.test(diary)
    },
    { 
      icon: '🎯', 
      label: /[计划|目标|希望|想要]/.test(diary) ? '有未来规划' : '可以加入期望',
      active: /[计划|目标|希望|想要]/.test(diary)
    },
  ];

  const handlePromptClick = (prompt: string) => {
    const newDiary = diary + (diary.length > 0 ? '\n\n' : '') + prompt + ' ';
    onDiaryChange(newDiary);
    setShowPrompts(false);
    
    // 聚焦到文本框末尾
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newDiary.length, newDiary.length);
      }
    }, 100);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_CHARACTERS) {
      onDiaryChange(newValue);
    }
  };

  const handleFocus = () => {
    setShowPrompts(false);
  };

  return (
    <Container>
      <Title>记录此刻</Title>
      <Description>
        写下你的想法、感受，或是今天发生的事情。这是属于你的私密空间。
      </Description>

      <AnimatePresence>
        {showPrompts && diary.length === 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <PromptSuggestions>
              {prompts.map((prompt, index) => (
                <PromptChip
                  key={prompt}
                  onClick={() => handlePromptClick(prompt)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {prompt}
                </PromptChip>
              ))}
            </PromptSuggestions>
          </motion.div>
        )}
      </AnimatePresence>

      <TextareaContainer>
        <StyledTextarea
          ref={textareaRef}
          value={diary}
          onChange={handleTextareaChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          $hasContent={diary.length > 0}
        />
        <WordCount
          $isNearLimit={isNearLimit}
          initial={{ opacity: 0 }}
          animate={{ opacity: diary.length > 0 ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {wordCount}/{MAX_CHARACTERS}
          {isOverLimit && ' (超出限制)'}
        </WordCount>
      </TextareaContainer>

      {diary.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Characteristics>
            {characteristics.map((char, index) => (
              <Characteristic
                key={char.label}
                $isActive={char.active}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CharacteristicIcon>{char.icon}</CharacteristicIcon>
                {char.label}
              </Characteristic>
            ))}
          </Characteristics>
        </motion.div>
      )}
    </Container>
  );
};

export default DiaryInput;