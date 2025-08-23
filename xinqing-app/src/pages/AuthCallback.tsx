import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { theme } from '../styles/theme';
import SimpleLoading from '../components/SimpleLoading';

const CallbackContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.gradient.primary};
  padding: ${theme.spacing.lg};
`;

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = () => {
      console.log('🔄 处理认证回调...');
      
      // Supabase Auth 会自动处理回调并设置会话
      // 我们只需要将用户重定向到主页
      setTimeout(() => {
        console.log('✅ 认证回调处理完成，重定向到主页');
        navigate('/', { replace: true });
      }, 2000);
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <CallbackContainer>
      <SimpleLoading
        type="app"
        size="large"
        message="登录成功！正在跳转..."
      />
    </CallbackContainer>
  );
};

export default AuthCallback;