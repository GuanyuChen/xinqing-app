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

const MoodIcon = styled.div`
  position: relative;
  z-index: 3;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
  }

  svg {
    width: 100%;
    height: 100%;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    animation: floatAndGlow 3s ease-in-out infinite;
  }

  @keyframes floatAndGlow {
    0%, 100% { 
      transform: translateY(0) scale(1);
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
    }
    50% { 
      transform: translateY(-2px) scale(1.05);
      filter: drop-shadow(0 4px 8px rgba(255, 255, 255, 0.3));
    }
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
      <MoodIcon>
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* 外圈 - 代表整体的情绪光环 */}
          <circle cx="16" cy="16" r="15" stroke="rgba(255, 255, 255, 0.6)" strokeWidth="0.8" fill="none">
            <animate attributeName="r" values="15;16;15" dur="4s" repeatCount="indefinite" />
            <animate attributeName="stroke-opacity" values="0.6;0.3;0.6" dur="4s" repeatCount="indefinite" />
          </circle>
          
          {/* 中心心形 - 代表核心情感 */}
          <path 
            d="M16 24c-1.2-1.8-6-5.4-6-10 0-2.8 2.2-5 5-5s5 2.2 5 5c0 4.6-4.8 8.2-6 10z M11 11c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" 
            fill="rgba(255, 255, 255, 0.9)"
            style={{ transformOrigin: '16px 16px' }}
          >
            <animateTransform 
              attributeName="transform" 
              type="scale" 
              values="1;1.1;1" 
              dur="3s" 
              repeatCount="indefinite"
            />
          </path>
          
          {/* 内部小点 - 代表不同的情绪状态 */}
          <circle cx="12" cy="14" r="1.5" fill="rgba(255, 255, 255, 0.7)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" begin="0s" />
          </circle>
          <circle cx="20" cy="14" r="1.5" fill="rgba(255, 255, 255, 0.7)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" begin="0.7s" />
          </circle>
          <circle cx="16" cy="18" r="1" fill="rgba(255, 255, 255, 0.8)">
            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" begin="1.4s" />
          </circle>
          
          {/* 柔和的光晕效果 */}
          <circle cx="16" cy="16" r="8" fill="url(#glowGradient)" opacity="0.3">
            <animate attributeName="opacity" values="0.3;0.5;0.3" dur="5s" repeatCount="indefinite" />
          </circle>
          
          <defs>
            <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.8)" />
              <stop offset="70%" stopColor="rgba(255, 255, 255, 0.3)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
            </radialGradient>
          </defs>
        </svg>
      </MoodIcon>
    </IconContainer>
  );
};

export default CenterIcon;