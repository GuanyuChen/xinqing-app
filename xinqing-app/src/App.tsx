import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from './styles/theme';
import { GlobalStyle } from './styles/GlobalStyle';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import TodayMoodRecord from './pages/TodayMoodRecord';
import HistoryPage from './pages/HistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PeriodPage from './pages/PeriodPage';
import AuthCallback from './pages/AuthCallback';
import CenterIcon from './components/CenterIcon';
import UserProfile from './components/UserProfile';
import SimpleLoading from './components/SimpleLoading';

const AppContainer = styled.div`
  background: ${theme.colors.gradient.primary};
  
  @media (min-width: 769px) {
    max-width: 1200px;
    margin: 0 auto;
    box-shadow: 0 0 40px rgba(186, 186, 222, 0.1);
    position: relative;
    width: 100%;
  }
`;

const Navigation = styled(motion.nav)`
  position: fixed;
  z-index: 100;
  
  /* PC端吸顶居中导航 */
  @media (min-width: 769px) {
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: ${theme.spacing.md} 0;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    gap: ${theme.spacing.lg};
  }
  
  /* 移动端底部固定导航 */
  @media (max-width: 768px) {
    bottom: ${theme.spacing.md};
    left: ${theme.spacing.md};
    right: ${theme.spacing.md};
    
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
  
  /* PC端水平导航样式 */
  @media (min-width: 769px) {
    justify-content: center;
    padding: ${theme.spacing.md} ${theme.spacing.xl};
    border-radius: ${theme.borderRadius.large};
    gap: ${theme.spacing.sm};
    margin: 0;
    margin-right: ${theme.spacing.lg}; /* 为用户头像预留空间 */
  }
  
  /* 移动端圆形导航样式 */
  @media (max-width: 768px) {
    justify-content: space-around;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    border-radius: ${theme.borderRadius.medium};
  }
`;

const NavItem = styled(motion.div)<{ $active: boolean; $isCenter?: boolean }>`
  position: relative;
  flex: ${props => props.$isCenter ? '0 0 auto' : '1'};
  
  /* PC端布局 */
  @media (min-width: 769px) {
    flex: 0 0 auto;
    display: flex;
    justify-content: center;
  }
  
  /* 移动端布局 */
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
  
  /* PC端水平布局 */
  @media (min-width: 769px) {
    flex-direction: row;
    min-width: 120px;
    padding: ${theme.spacing.md} ${theme.spacing.lg};
    gap: ${theme.spacing.sm};
  }
  
  /* 移动端垂直布局 */
  @media (max-width: 768px) {
    flex-direction: column;
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
  
  /* PC端图标样式 */
  @media (min-width: 769px) {
    font-size: 1.3rem;
    margin-bottom: 0;
    margin-right: ${theme.spacing.xs};
  }
  
  /* 移动端图标样式 */
  @media (max-width: 768px) {
    font-size: 1.3rem;
    margin-bottom: 2px;
  }
`;

const NavLabel = styled.div`
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  text-align: center;
  
  /* PC端标签样式 */
  @media (min-width: 769px) {
    font-size: ${theme.typography.fontSize.sm};
  }
  
  /* 移动端标签样式 */
  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

const MainContent = styled(motion.main)`
  flex: 1;
  
  /* PC端为吸顶导航预留空间，避免遮挡 */
  @media (min-width: 769px) {
    padding-top: 120px; /* 为吸顶导航预留足够空间，避免遮挡 */
    padding-left: ${theme.spacing.xl};
    padding-right: ${theme.spacing.xl};
  }
  
  /* 移动端为底部固定导航预留空间 */
  @media (max-width: 768px) {
    padding-bottom: 100px; /* 为底部导航预留空间 */
  }
`;

const CenterIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 ${theme.spacing.md};
  pointer-events: none;
  
  /* PC端隐藏中央图标 */
  @media (min-width: 769px) {
    display: none;
  }
  
  /* 移动端显示中央图标 */
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

// 响应式导航组件
const ResponsiveNavigation: React.FC = () => {
  const location = useLocation();
  const isMobile = window.innerWidth <= 768;

  return (
    <Navigation
      initial={{ opacity: 0, y: isMobile ? 50 : -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <NavContainer>
        {isMobile ? (
          <>
            {/* 移动端布局：前半部分 */}
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
            
            {/* 中央图标 */}
            <CenterIconContainer>
              <CenterIcon />
            </CenterIconContainer>
            
            {/* 移动端布局：后半部分 */}
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
          </>
        ) : (
          <>
            {/* PC端布局：全部导航项 */}
            {navItems.map((item) => {
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
          </>
        )}
      </NavContainer>
      
      {/* PC端用户头像，只在认证后显示 */}
      {!isMobile && (
        <UserProfile />
      )}
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
  return (
    <Router>
      <AuthProvider>
        <AppWithAuth />
      </AuthProvider>
    </Router>
  );
};

// 需要认证的主应用组件
const AppWithAuth: React.FC = () => {
  const { user, loading } = useAuth();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // 等待认证状态确定
        if (!loading) {
          // 简化初始化过程，只需要短暂加载
          await new Promise(resolve => setTimeout(resolve, 1000));
          setIsInitialLoading(false);
        }
      } catch (error) {
        console.error('应用初始化失败:', error);
        // 即使失败也要继续，确保应用可用
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsInitialLoading(false);
      }
    };

    initializeApp();
  }, [loading]);

  // 认证回调页面，无需认证即可访问
  if (location.pathname === '/auth/callback') {
    return (
      <>
        <GlobalStyle />
        <AuthCallback />
      </>
    );
  }

  // 认证加载中
  if (loading || isInitialLoading) {
    return (
      <>
        <GlobalStyle />
        <SimpleLoading
          type="app"
          size="large"
          message="心情小助手"
        />
      </>
    );
  }

  // 未认证，显示登录页面
  if (!user) {
    return (
      <>
        <GlobalStyle />
        <LoginPage />
      </>
    );
  }

  // 已认证，显示主应用
  return (
    <AppContainer>
      <GlobalStyle />
      <AppRoutes />
      <ResponsiveNavigation />
    </AppContainer>
  );
};

export default App;
