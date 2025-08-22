import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../styles/theme';

interface SimpleLoadingProps {
  size?: 'small' | 'medium' | 'large';
  type?: 'app' | 'content';
  message?: string;
}

const breathe = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;

const AppLoadingContainer = styled.div`
  position: fixed;
  inset: 0;
  background: ${theme.colors.gradient.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ContentLoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.xl};
`;

const LoadingIcon = styled(motion.div)<{ $size: 'small' | 'medium' | 'large' }>`
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return '1.5rem';
      case 'medium': return '2.5rem';
      case 'large': return '3.5rem';
      default: return '2.5rem';
    }
  }};
  animation: ${breathe} 2s ease-in-out infinite;
  margin-bottom: ${theme.spacing.md};
`;

const LoadingMessage = styled(motion.div)<{ $size: 'small' | 'medium' | 'large' }>`
  font-size: ${props => {
    switch (props.$size) {
      case 'small': return theme.typography.fontSize.sm;
      case 'medium': return theme.typography.fontSize.base;
      case 'large': return theme.typography.fontSize.lg;
      default: return theme.typography.fontSize.base;
    }
  }};
  color: ${theme.colors.text.primary};
  text-align: center;
  font-weight: ${theme.typography.fontWeight.medium};
  animation: ${pulse} 2s ease-in-out infinite;
`;

const ContentPlaceholder = styled.div<{ $height?: string }>`
  width: 100%;
  height: ${props => props.$height || '60px'};
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.4) 25%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0.4) 75%
  );
  background-size: 200% 100%;
  border-radius: ${theme.borderRadius.medium};
  animation: ${pulse} 1.5s ease-in-out infinite;
  margin-bottom: ${theme.spacing.md};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SimpleLoading: React.FC<SimpleLoadingProps> = ({
  size = 'medium',
  type = 'content',
  message = '加载中...'
}) => {
  if (type === 'app') {
    return (
      <AppLoadingContainer>
        <LoadingIcon
          $size={size}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, type: "spring" }}
        >
          🌸
        </LoadingIcon>
        <LoadingMessage
          $size={size}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {message}
        </LoadingMessage>
      </AppLoadingContainer>
    );
  }

  return (
    <ContentLoadingContainer>
      <LoadingIcon
        $size={size}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, type: "spring" }}
      >
        💝
      </LoadingIcon>
      <LoadingMessage
        $size={size}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {message}
      </LoadingMessage>
    </ContentLoadingContainer>
  );
};

export const ContentPlaceholders: React.FC<{ count?: number; heights?: string[] }> = ({ 
  count = 3, 
  heights = ['80px', '60px', '70px'] 
}) => {
  return (
    <ContentLoadingContainer>
      {Array.from({ length: count }).map((_, index) => (
        <ContentPlaceholder
          key={index}
          $height={heights[index] || '60px'}
        />
      ))}
    </ContentLoadingContainer>
  );
};

export default SimpleLoading;