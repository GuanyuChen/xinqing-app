import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../styles/theme';

interface IntensitySelectorProps {
  intensity: number;
  onIntensityChange: (intensity: number) => void;
  disabled?: boolean;
}

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.sm};
`;

const Description = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
  margin-bottom: ${theme.spacing.xl};
`;

const IntensitySlider = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 400px;
  margin: 0 auto ${theme.spacing.lg};
  position: relative;
`;

const IntensityDot = styled(motion.div)<{ $selected: boolean; $intensity: number }>`
  width: ${props => props.$selected ? '24px' : '16px'};
  height: ${props => props.$selected ? '24px' : '16px'};
  border-radius: 50%;
  background: ${props => {
    if (props.$selected) {
      const colors = ['#E6A09B', '#F5B2A8', '#F5D785', '#B8E6B8', '#9BB5E6'];
      return colors[props.$intensity - 1] || colors[0];
    }
    return theme.colors.accent.warmGray;
  }};
  cursor: pointer;
  transition: all ${theme.animation.transition.normal};
  border: 2px solid ${props => props.$selected ? 'rgba(255,255,255,0.8)' : 'transparent'};
  box-shadow: ${props => props.$selected ? theme.shadows.gentle : 'none'};
  
  &:hover {
    transform: scale(1.2);
    box-shadow: ${theme.shadows.hover};
  }
`;

const IntensityTrack = styled.div`
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: ${theme.colors.accent.warmGray};
  transform: translateY(-50%);
  border-radius: 1px;
  z-index: -1;
`;

const IntensityProgress = styled(motion.div)<{ $progress: number }>`
  position: absolute;
  top: 50%;
  left: 0;
  height: 4px;
  background: linear-gradient(90deg, 
    ${theme.colors.mood.angry} 0%, 
    ${theme.colors.mood.anxious} 25%, 
    ${theme.colors.mood.happy} 50%, 
    ${theme.colors.mood.calm} 75%, 
    ${theme.colors.mood.peaceful} 100%
  );
  transform: translateY(-50%);
  border-radius: 2px;
  z-index: -1;
  width: ${props => props.$progress}%;
  transition: width ${theme.animation.transition.normal};
`;

const IntensityLabels = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 400px;
  margin: 0 auto ${theme.spacing.md};
  font-size: ${theme.typography.fontSize.xs};
  color: ${theme.colors.text.light};
`;

const IntensityValue = styled(motion.div)`
  text-align: center;
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.text.primary};
  margin-bottom: ${theme.spacing.sm};
`;

const IntensityDescription = styled(motion.div)<{ $intensity: number }>`
  text-align: center;
  font-size: ${theme.typography.fontSize.base};
  color: ${props => {
    const colors = [
      theme.colors.mood.angry,
      theme.colors.mood.anxious,
      theme.colors.mood.happy,
      theme.colors.mood.calm,
      theme.colors.mood.peaceful
    ];
    return colors[props.$intensity - 1] || theme.colors.text.secondary;
  }};
  font-weight: ${theme.typography.fontWeight.medium};
  min-height: 24px;
`;

const intensityLabels = ['很轻', '较轻', '中等', '较强', '很强'];
const intensityDescriptions = [
  '轻微感受',
  '有所察觉',
  '明显感受',
  '强烈感受',
  '非常强烈'
];

const IntensitySelector: React.FC<IntensitySelectorProps> = ({
  intensity,
  onIntensityChange,
  disabled = false,
}) => {
  const [hoveredIntensity, setHoveredIntensity] = useState<number | null>(null);

  const displayIntensity = hoveredIntensity || intensity;
  const progress = (displayIntensity / 5) * 100;

  return (
    <Container>
      <Title>情绪强度</Title>
      <Description>这种感受有多强烈？</Description>
      
      <IntensityValue
        key={displayIntensity}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {displayIntensity}/5
      </IntensityValue>
      
      <IntensityDescription 
        $intensity={displayIntensity}
        key={`desc-${displayIntensity}`}
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {intensityDescriptions[displayIntensity - 1]}
      </IntensityDescription>
      
      <IntensitySlider>
        <IntensityTrack />
        <IntensityProgress $progress={progress} />
        
        {[1, 2, 3, 4, 5].map((value) => (
          <IntensityDot
            key={value}
            $selected={intensity === value}
            $intensity={value}
            onClick={() => !disabled && onIntensityChange(value)}
            onMouseEnter={() => setHoveredIntensity(value)}
            onMouseLeave={() => setHoveredIntensity(null)}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            initial={{ scale: 0 }}
            animate={{ scale: intensity === value ? 1.2 : 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        ))}
      </IntensitySlider>
      
      <IntensityLabels>
        {intensityLabels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </IntensityLabels>
    </Container>
  );
};

export default IntensitySelector;