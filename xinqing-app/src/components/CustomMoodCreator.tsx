import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../styles/theme';

interface CustomMoodCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customMood: { name: string; icon: string; color: string; description: string }) => void;
}

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: ${theme.spacing.md};
`;

const Modal = styled(motion.div)`
  background: ${theme.colors.gradient.card};
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.hover};
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  
  @media (max-width: 768px) {
    max-width: 90vw;
    padding: ${theme.spacing.lg};
  }
`;

const Title = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.lg};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  backdrop-filter: blur(10px);
  transition: all ${theme.animation.transition.normal};
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.accent.deepLavender};
    background: rgba(255, 255, 255, 0.2);
  }
  
  &::placeholder {
    color: ${theme.colors.text.light};
  }
`;

const TextArea = styled.textarea`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.1);
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.base};
  backdrop-filter: blur(10px);
  transition: all ${theme.animation.transition.normal};
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${theme.colors.accent.deepLavender};
    background: rgba(255, 255, 255, 0.2);
  }
  
  &::placeholder {
    color: ${theme.colors.text.light};
  }
`;

const ColorPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.xs};
`;

const ColorOption = styled.div<{ $color: string; $selected: boolean }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: ${props => props.$color};
  cursor: pointer;
  border: 2px solid ${props => props.$selected ? theme.colors.text.primary : 'transparent'};
  transition: all ${theme.animation.transition.normal};
  
  &:hover {
    transform: scale(1.1);
  }
`;

const EmojiPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.xs};
  max-height: 120px;
  overflow-y: auto;
`;

const EmojiOption = styled.div<{ $selected: boolean }>`
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;
  border-radius: ${theme.borderRadius.small};
  background: ${props => props.$selected ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border: 1px solid ${props => props.$selected ? theme.colors.accent.deepLavender : 'transparent'};
  transition: all ${theme.animation.transition.normal};
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.lg};
`;

const Button = styled(motion.button)<{ $variant: 'primary' | 'secondary' }>`
  flex: 1;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.medium};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: all ${theme.animation.transition.normal};
  
  ${props => props.$variant === 'primary' ? `
    background: ${theme.colors.accent.deepLavender};
    color: white;
    border: none;
    
    &:hover {
      background: ${theme.colors.accent.softBlue};
      transform: translateY(-1px);
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
      background: rgba(255, 255, 255, 0.1);
      border-color: ${theme.colors.accent.deepLavender};
    }
  `}
`;

const predefinedColors = [
  '#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
  '#FFB6C1', '#87CEEB', '#98FB98', '#F0E68C', '#FFA07A', '#D3D3D3',
  '#FF69B4', '#00CED1', '#32CD32', '#FFD700', '#FF4500', '#9370DB'
];

const emojiList = [
  '😊', '😢', '😡', '😴', '🤩', '😰', '😌', '🧘‍♀️',
  '🥳', '😔', '😤', '🥱', '🤗', '😱', '😇', '🙏',
  '💖', '💔', '💪', '🌟', '🔥', '❄️', '🌈', '⚡',
  '🎉', '💤', '🎯', '🚀', '🌙', '☀️', '🍀', '🎈',
  '🎭', '🎨', '🎵', '📚', '☕', '🍃', '🌊', '🏔️'
];

const CustomMoodCreator: React.FC<CustomMoodCreatorProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState(predefinedColors[0]);
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && icon && color && description.trim()) {
      onSave({
        name: name.trim(),
        icon,
        color,
        description: description.trim()
      });
      handleReset();
    }
  };

  const handleReset = () => {
    setName('');
    setIcon('');
    setColor(predefinedColors[0]);
    setDescription('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const canSave = name.trim().length > 0 && icon && description.trim().length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <Overlay
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <Modal
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            onClick={(e) => e.stopPropagation()}
          >
            <Title>创建自定义心情</Title>
            
            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>心情名称 *</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="输入心情名称（如：兴奋不已）"
                  maxLength={20}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label>选择图标 *</Label>
                <EmojiPicker>
                  {emojiList.map((emoji) => (
                    <EmojiOption
                      key={emoji}
                      $selected={icon === emoji}
                      onClick={() => setIcon(emoji)}
                    >
                      {emoji}
                    </EmojiOption>
                  ))}
                </EmojiPicker>
              </FormGroup>

              <FormGroup>
                <Label>选择颜色 *</Label>
                <ColorPicker>
                  {predefinedColors.map((colorOption) => (
                    <ColorOption
                      key={colorOption}
                      $color={colorOption}
                      $selected={color === colorOption}
                      onClick={() => setColor(colorOption)}
                    />
                  ))}
                </ColorPicker>
              </FormGroup>

              <FormGroup>
                <Label>心情描述 *</Label>
                <TextArea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="描述这种心情的感受（如：充满活力和热情）"
                  maxLength={100}
                  required
                />
              </FormGroup>

              <ButtonGroup>
                <Button
                  type="button"
                  $variant="secondary"
                  onClick={handleClose}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  $variant="primary"
                  disabled={!canSave}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  保存
                </Button>
              </ButtonGroup>
            </Form>
          </Modal>
        </Overlay>
      )}
    </AnimatePresence>
  );
};

export default CustomMoodCreator;