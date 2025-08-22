import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+SC:wght@400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body {
    height: 100%;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch; /* iOS 流畅滚动 */
    -webkit-tap-highlight-color: transparent; /* 移除点击高亮 */
    -webkit-touch-callout: none; /* 禁用长按菜单 */
  }

  body {
    font-family: ${theme.typography.fontFamily.primary};
    font-size: ${theme.typography.fontSize.base};
    font-weight: ${theme.typography.fontWeight.normal};
    line-height: ${theme.typography.lineHeight.normal};
    color: ${theme.colors.text.primary};
    background: ${theme.colors.gradient.primary};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    
    /* 移动端优化 */
    @media (max-width: 768px) {
      font-size: ${theme.typography.fontSize.sm};
    }
  }

  #root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* 柔和的滚动条样式 */
  ::-webkit-scrollbar {
    width: 6px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.3);
    border-radius: ${theme.borderRadius.small};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.accent.deepLavender};
    border-radius: ${theme.borderRadius.small};
    transition: background ${theme.animation.transition.normal};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.text.secondary};
  }

  /* 按钮重置与基础样式 */
  button {
    border: none;
    background: none;
    cursor: pointer;
    font-family: inherit;
    font-size: inherit;
    transition: all ${theme.animation.transition.normal};
    border-radius: ${theme.borderRadius.medium};
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation; /* 优化触摸响应 */
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(230, 224, 242, 0.5);
    }
    
    &:active {
      transform: scale(0.98);
    }
    
    /* 移动端优化 */
    @media (max-width: 768px) {
      min-height: 44px; /* 最小触摸目标 */
      min-width: 44px;
    }
  }

  /* 输入框基础样式 */
  input, textarea {
    border: 2px solid transparent;
    background: rgba(255, 255, 255, 0.8);
    border-radius: ${theme.borderRadius.medium};
    padding: ${theme.spacing.md};
    font-family: inherit;
    font-size: inherit;
    color: ${theme.colors.text.primary};
    transition: all ${theme.animation.transition.normal};
    
    &:focus {
      outline: none;
      border-color: ${theme.colors.accent.deepLavender};
      background: rgba(255, 255, 255, 0.95);
      box-shadow: ${theme.shadows.gentle};
    }
    
    &::placeholder {
      color: ${theme.colors.text.light};
    }
  }

  /* 链接样式 */
  a {
    color: ${theme.colors.text.primary};
    text-decoration: none;
    transition: color ${theme.animation.transition.normal};
    
    &:hover {
      color: ${theme.colors.text.secondary};
    }
  }

  /* 柔和的选择高亮 */
  ::selection {
    background-color: ${theme.colors.accent.deepLavender};
    color: ${theme.colors.text.white};
  }

  ::-moz-selection {
    background-color: ${theme.colors.accent.deepLavender};
    color: ${theme.colors.text.white};
  }

  /* 动画类 */
  .fade-in {
    animation: fadeIn ${theme.animation.transition.slow} ${theme.animation.gentle};
  }

  .slide-up {
    animation: slideUp ${theme.animation.transition.normal} ${theme.animation.gentle};
  }

  .bounce-in {
    animation: bounceIn 0.6s ${theme.animation.bounce};
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(20px);
    }
    to { 
      opacity: 1; 
      transform: translateY(0);
    }
  }

  @keyframes bounceIn {
    from {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  /* 毛玻璃效果工具类 */
  .glass-effect {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }

  /* 果冻按钮效果 */
  .jelly-button {
    transition: transform ${theme.animation.transition.fast};
    
    &:hover {
      transform: scale(1.02);
    }
    
    &:active {
      transform: scale(0.98);
    }
  }
`;