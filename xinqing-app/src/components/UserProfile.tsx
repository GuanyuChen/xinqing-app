import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../styles/theme';
import { useAuth } from '../contexts/AuthContext';

const UserProfileContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: rgba(255, 255, 255, 0.1);
  border-radius: ${theme.borderRadius.large};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all ${theme.animation.transition.normal};

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

const UserAvatar = styled.div<{ $src?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$src ? `url(${props.$src})` : theme.colors.accent.deepLavender};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: ${theme.typography.fontWeight.medium};
  border: 2px solid rgba(255, 255, 255, 0.3);
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const UserName = styled.div`
  color: white;
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
`;

const UserEmail = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: ${theme.typography.fontSize.xs};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: ${theme.spacing.xs};
  background: white;
  border-radius: ${theme.borderRadius.medium};
  box-shadow: ${theme.shadows.hover};
  border: 1px solid rgba(0, 0, 0, 0.1);
  min-width: 180px;
  overflow: hidden;
  z-index: 1000;
`;

const DropdownItem = styled.div`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  color: ${theme.colors.text.primary};
  font-size: ${theme.typography.fontSize.sm};
  cursor: pointer;
  transition: background-color ${theme.animation.transition.fast};
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f8fafc;
  }

  &.danger {
    color: #dc2626;
    
    &:hover {
      background-color: #fef2f2;
    }
  }
`;

interface UserProfileProps {
  onLogout?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onLogout }) => {
  const { user, signOut } = useAuth();
  const [showDropdown, setShowDropdown] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      onLogout?.();
    } catch (error) {
      console.error('登出失败:', error);
    } finally {
      setShowDropdown(false);
    }
  };

  if (!user) return null;

  const displayName = user.user_metadata?.full_name || user.user_metadata?.name || '用户';
  const email = user.email || '';
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ position: 'relative' }} ref={containerRef}>
      <UserProfileContainer
        onClick={() => setShowDropdown(!showDropdown)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <UserAvatar $src={avatarUrl}>
          {!avatarUrl && initials}
        </UserAvatar>
        <UserInfo>
          <UserName>{displayName}</UserName>
          <UserEmail>{email}</UserEmail>
        </UserInfo>
      </UserProfileContainer>

      {showDropdown && (
        <DropdownMenu
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          <DropdownItem>
            <div style={{ fontWeight: 500 }}>{displayName}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{email}</div>
          </DropdownItem>
          <DropdownItem className="danger" onClick={handleLogout}>
            退出登录
          </DropdownItem>
        </DropdownMenu>
      )}
    </div>
  );
};

export default UserProfile;