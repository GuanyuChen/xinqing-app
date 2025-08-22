import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const IconContainer = styled(motion.div)`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    z-index: 1;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%);
    animation: shimmer 2s ease-in-out infinite;
    z-index: 2;
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(200%) rotate(45deg); }
  }
`;

const HeartIcon = styled.div`
  position: relative;
  z-index: 3;
  font-size: 24px;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    font-size: 20px;
  }

  &::before {
    content: '💝';
    animation: pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const CenterIcon: React.FC = () => {
  return (
    <IconContainer
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.5
      }}
      whileHover={{
        scale: 1.05,
        boxShadow: "0 12px 40px rgba(102, 126, 234, 0.6)"
      }}
    >
      <HeartIcon />
    </IconContainer>
  );
};

export default CenterIcon;