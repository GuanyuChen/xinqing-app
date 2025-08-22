export const theme = {
  colors: {
    primary: {
      cream: '#FDF8F4',      // 奶白色
      lavender: '#E6E0F2',   // 雾紫色
      skyBlue: '#D6E8F5',    // 淡蓝色
      softPink: '#F2E6E9',   // 柔粉色
      sage: '#E8F2E6',       // 淡绿色
    },
    accent: {
      deepLavender: '#C8B7E0', // 深雾紫
      softBlue: '#B8D4ED',     // 柔蓝
      warmGray: '#E8E5E2',     // 暖灰
    },
    text: {
      primary: '#4A4456',    // 深紫灰
      secondary: '#8B7E9B',  // 中紫灰
      light: '#B8A9C9',      // 浅紫灰
      white: '#FFFFFF',
    },
    mood: {
      happy: '#F5D785',      // 温暖黄
      sad: '#9BB5E6',        // 柔和蓝
      anxious: '#F5B2A8',    // 柔和橙红
      calm: '#B8E6B8',       // 平静绿
      angry: '#E6A09B',      // 柔和红
      excited: '#F5C2F5',    // 柔和粉紫
      tired: '#D1C4E9',      // 疲惫紫
      peaceful: '#C8E6C9',   // 宁静绿
    },
    gradient: {
      primary: 'linear-gradient(135deg, #FDF8F4 0%, #E6E0F2 50%, #D6E8F5 100%)',
      soft: 'linear-gradient(45deg, #F2E6E9 0%, #E8F2E6 100%)',
      card: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(230,224,242,0.6) 100%)',
    }
  },
  shadows: {
    soft: '0 4px 20px rgba(186, 186, 222, 0.15)',
    gentle: '0 2px 10px rgba(186, 186, 222, 0.1)',
    hover: '0 6px 25px rgba(186, 186, 222, 0.2)',
  },
  borderRadius: {
    small: '8px',
    medium: '12px',
    large: '20px',
    round: '50%',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      secondary: '"Noto Sans SC", sans-serif',
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      xxl: '24px',
      xxxl: '32px',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      loose: 1.8,
    }
  },
  animation: {
    transition: {
      fast: '0.15s ease-out',
      normal: '0.3s ease-out',
      slow: '0.5s ease-out',
    },
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    gentle: 'cubic-bezier(0.25, 0.8, 0.25, 1)',
  }
};

export type Theme = typeof theme;