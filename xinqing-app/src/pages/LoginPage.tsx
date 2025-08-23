import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';
import SimpleLoading from '../components/SimpleLoading';

const LoginContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.gradient.primary};
  padding: ${theme.spacing.lg};
`;

const LoginCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: ${theme.borderRadius.large};
  padding: ${theme.spacing.xxl};
  box-shadow: ${theme.shadows.hover};
  border: 1px solid rgba(255, 255, 255, 0.3);
  text-align: center;
  max-width: 400px;
  width: 100%;
  
  @media (max-width: 768px) {
    margin: ${theme.spacing.md};
    padding: ${theme.spacing.xl};
  }
`;

const Logo = styled.div`
  font-size: 4rem;
  margin-bottom: ${theme.spacing.lg};
  
  @media (max-width: 768px) {
    font-size: 3rem;
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
`;

const Subtitle = styled.p`
  color: ${theme.colors.text.secondary};
  margin-bottom: ${theme.spacing.xxl};
  font-size: ${theme.typography.fontSize.base};
  line-height: 1.5;
`;

const GoogleButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.md};
  width: 100%;
  padding: ${theme.spacing.lg} ${theme.spacing.xl};
  background: white;
  border: 2px solid #dadce0;
  border-radius: ${theme.borderRadius.large};
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: #3c4043;
  cursor: pointer;
  transition: all ${theme.animation.transition.normal};
  
  &:hover:not(:disabled) {
    border-color: #d2d3d4;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  &:active:not(:disabled) {
    transform: translateY(1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;


const ErrorMessage = styled(motion.div)`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.medium};
  margin-top: ${theme.spacing.lg};
  font-size: ${theme.typography.fontSize.sm};
`;

const Features = styled.div`
  margin-top: ${theme.spacing.xl};
  text-align: left;
`;

const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
  color: ${theme.colors.text.secondary};
  font-size: ${theme.typography.fontSize.sm};
`;

const FeatureIcon = styled.div`
  font-size: 1.2rem;
  color: ${theme.colors.accent.deepLavender};
`;

// Google 图标的 SVG 组件
const GoogleIconSVG = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const LoginPage: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setError(null);
      setIsLoggingIn(true);
      await signInWithGoogle();
    } catch (error: any) {
      console.error('登录失败:', error);
      setError(error.message || '登录失败，请稍后重试');
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <SimpleLoading
        type="app"
        size="large"
        message="初始化中..."
      />
    );
  }

  return (
    <LoginContainer>
      <LoginCard
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Logo>🌸</Logo>
        <Title>心情小助手</Title>
        <Subtitle>
          记录每一天的心情变化，<br />
          发现内心的美好时光
        </Subtitle>

        <GoogleButton
          onClick={handleGoogleLogin}
          disabled={isLoggingIn}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {isLoggingIn ? (
            <>
              <div style={{ width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SimpleLoading type="app" size="small" />
              </div>
              登录中...
            </>
          ) : (
            <>
              <GoogleIconSVG />
              使用 Google 账号登录
            </>
          )}
        </GoogleButton>

        {error && (
          <ErrorMessage
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
          >
            {error}
          </ErrorMessage>
        )}

        <Features>
          <FeatureItem>
            <FeatureIcon>🔒</FeatureIcon>
            安全的数据加密存储
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>📊</FeatureIcon>
            智能心情趋势分析
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>🎨</FeatureIcon>
            个性化心情记录
          </FeatureItem>
          <FeatureItem>
            <FeatureIcon>☁️</FeatureIcon>
            云端同步，随时访问
          </FeatureItem>
        </Features>
      </LoginCard>
    </LoginContainer>
  );
};

export default LoginPage;