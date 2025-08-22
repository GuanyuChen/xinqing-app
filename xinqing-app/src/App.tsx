import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import TodayMoodRecord from './pages/TodayMoodRecord';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PeriodPage from './pages/PeriodPage';
import CenterIcon from './components/CenterIcon';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${theme.colors.gradient.primary};
`;

const Navigation = styled(motion.nav)`
  position: fixed;
  bottom: ${theme.spacing.lg};
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  
  @media (max-width: 768px) {
    bottom: ${theme.spacing.md};
    left: ${theme.spacing.md};
    right: ${theme.spacing.md};
    transform: none;
    width: auto;
    
    /* iOS 安全区域适配 */
    padding-bottom: env(safe-area-inset-bottom);
    margin-bottom: ${theme.spacing.sm};
  }
`;

const NavContainer = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.sm};
  box-shadow: ${theme.shadows.hover};
  border: 1px solid rgba(255, 255, 255, 0.3);
  gap: ${theme.spacing.xs};
  position: relative;
  
  @media (max-width: 768px) {
    justify-content: space-around;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.borderRadius.medium};
  }
`;

const NavItem = styled(motion.div)<{ $active: boolean; $isCenter?: boolean }>`
  position: relative;
  flex: ${props => props.$isCenter ? '0 0 auto' : '1'};
  
  @media (max-width: 768px) {
    display: flex;
    justify-content: center;
  }
`;

const NavLink = styled(Link)<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.medium};
  text-decoration: none;
  transition: all ${theme.animation.transition.normal};
  min-width: 80px;
  position: relative;
  touch-action: manipulation;
  user-select: none;
  
  ${props => props.$active ? `
    color: white;
  ` : `
    color: ${theme.colors.text.secondary};
    &:hover {
      color: ${theme.colors.text.primary};
      background: rgba(255, 255, 255, 0.5);
    }
  `}
  
  @media (max-width: 768px) {
    padding: ${theme.spacing.md} ${theme.spacing.sm};
    min-width: 50px;
    min-height: 44px; /* iOS 推荐的最小触摸区域 */
  }
`;

const NavBackground = styled(motion.div)`
  position: absolute;
  inset: ${theme.spacing.xs};
  background: ${theme.colors.accent.deepLavender};
  border-radius: ${theme.borderRadius.medium};
  z-index: -1;
  
  @media (max-width: 768px) {
    inset: 4px;
    border-radius: ${theme.borderRadius.small};
  }
`;

const NavIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: ${theme.spacing.xs};
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 2px;
  }
`;

const NavLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

const MainContent = styled(motion.main)`
  flex: 1;
  padding-bottom: 120px; // 为底部导航留出空间
  
  @media (max-width: 768px) {
    padding-bottom: 100px; // 移动端增加更多空间适配安全区域
  }
`;

const InitialLoading = styled.div`
  position: fixed;
  inset: 0;
  background: ${theme.colors.gradient.primary};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const LoadingIcon = styled(motion.div)`
  font-size: 4rem;
  margin-bottom: ${theme.spacing.lg};
`;

const LoadingText = styled(motion.div)`
  font-size: ${theme.typography.fontSize.lg};
  color: ${theme.colors.text.primary};
  text-align: center;
  margin-bottom: ${theme.spacing.md};
`;

const LoadingSubtext = styled(motion.div)`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.text.secondary};
  text-align: center;
`;

const CenterIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 ${theme.spacing.md};
  pointer-events: none;
  
  @media (max-width: 768px) {
    margin: 0 ${theme.spacing.sm};
  }
`;

// 导航配置
const navItems = [
  {
    path: '/',
    icon: '✍️',
    label: '记录',
  },
  {
    path: '/history',
    icon: '📚',
    label: '历史',
  },
  {
    path: '/period',
    icon: '🌸',
    label: '月经',
  },
  {
    path: '/analytics',
    icon: '📊',
    label: '分析',
  },
];

// 底部导航组件
const BottomNavigation: React.FC = () => {
  const location = useLocation();

  return (
    <Navigation
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <NavContainer>
        {navItems.slice(0, Math.ceil(navItems.length / 2)).map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <NavItem key={item.path} $active={isActive}>
              <NavLink to={item.path} $active={isActive}>
                {isActive && (
                  <NavBackground
                    layoutId="nav-background"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <NavIcon>{item.icon}</NavIcon>
                <NavLabel>{item.label}</NavLabel>
              </NavLink>
            </NavItem>
          );
        })}
        
        <CenterIconContainer>
          <CenterIcon />
        </CenterIconContainer>
        
        {navItems.slice(Math.ceil(navItems.length / 2)).map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <NavItem key={item.path} $active={isActive}>
              <NavLink to={item.path} $active={isActive}>
                {isActive && (
                  <NavBackground
                    layoutId="nav-background"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <NavIcon>{item.icon}</NavIcon>
                <NavLabel>{item.label}</NavLabel>
              </NavLink>
            </NavItem>
          );
        })}
      </NavContainer>
    </Navigation>
  );
};

// 页面路由组件
const AppRoutes: React.FC = () => {
  return (
    <MainContent>
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/"
            element={
              <motion.div
                key="today"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <TodayMoodRecord />
              </motion.div>
            }
          />
          <Route
            path="/history"
            element={
              <motion.div
                key="history"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <HistoryPage />
              </motion.div>
            }
          />
          <Route
            path="/period"
            element={
              <motion.div
                key="period"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <PeriodPage />
              </motion.div>
            }
          />
          <Route
            path="/analytics"
            element={
              <motion.div
                key="analytics"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <AnalyticsPage />
              </motion.div>
            }
          />
        </Routes>
      </AnimatePresence>
    </MainContent>
  );
};

const App: React.FC = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingSteps = [
    { icon: '🎨', text: '初始化界面', subtext: '准备柔和的视觉体验' },
    { icon: '💾', text: '准备数据存储', subtext: '连接到云端数据库' },
    { icon: '🔗', text: '初始化 Supabase 连接', subtext: '确保数据安全同步' },
    { icon: '✨', text: '完成准备', subtext: '一切就绪，开始记录心情吧！' },
  ];

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 步骤 1: 初始化界面
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoadingStep(1);

        // 步骤 2: 准备数据存储
        await new Promise(resolve => setTimeout(resolve, 600));
        setLoadingStep(2);

        // 步骤 3: 初始化 Supabase 连接
        await new Promise(resolve => setTimeout(resolve, 800));
        setLoadingStep(3);

        // 步骤 4: 完成初始化
        await new Promise(resolve => setTimeout(resolve, 600));
        setIsInitialLoading(false);

      } catch (error) {
        console.error('应用初始化失败:', error);
        // 即使失败也要继续，确保应用可用
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsInitialLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isInitialLoading) {
    const currentStep = loadingSteps[loadingStep];
    
    return (
      <>
        <GlobalStyle />
        <InitialLoading>
          <LoadingIcon
            key={`icon-${loadingStep}`}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10 }}
          >
            {currentStep.icon}
          </LoadingIcon>
          
          <LoadingText
            key={`text-${loadingStep}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {currentStep.text}
          </LoadingText>
          
          <LoadingSubtext
            key={`subtext-${loadingStep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {currentStep.subtext}
          </LoadingSubtext>
        </InitialLoading>
      </>
    );
  }

  return (
    <Router>
      <AppContainer>
        <GlobalStyle />
        <AppRoutes />
        <BottomNavigation />
      </AppContainer>
    </Router>
  );
};

export default App;
