export interface ThemePalette {
  isDark: boolean;
  background: string;
  cardBackground: string;
  cardBorder: string;
  
  primary: string;
  primaryDark: string;
  primaryGradient: string[];
  
  chatBubbleSender: string;
  chatBubbleReceiver: string;
  
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  
  onlineBadge: string;
  recordingBadge: string;
  videoBadge: string;
  
  inputBackground: string;
  inputBorder: string;
}

// Instagram & Facebook Messenger familiar dark theme
export const DarkTheme: ThemePalette = {
  isDark: true,
  background: '#18191A',
  cardBackground: '#242526',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  
  primary: '#0084FF',
  primaryDark: '#0066CC',
  primaryGradient: ['#3797EF', '#0084FF'],
  
  chatBubbleSender: '#2563EB',
  chatBubbleReceiver: '#3A3B3C',
  
  textPrimary: '#E4E6EB',
  textSecondary: '#B0B3B8',
  textMuted: '#8A8D91',
  
  onlineBadge: '#31A24C',
  recordingBadge: '#FA383E',
  videoBadge: '#0084FF',
  
  inputBackground: '#3A3B3C',
  inputBorder: 'rgba(255, 255, 255, 0.1)'
};

// Instagram & Facebook Messenger familiar light theme
export const LightTheme: ThemePalette = {
  isDark: false,
  background: '#FFFFFF',
  cardBackground: '#F0F2F5',
  cardBorder: 'rgba(0, 0, 0, 0.06)',
  
  primary: '#0084FF',
  primaryDark: '#0066CC',
  primaryGradient: ['#3797EF', '#0084FF'],
  
  chatBubbleSender: '#2563EB',
  chatBubbleReceiver: '#E4E6EB',
  
  textPrimary: '#050505',
  textSecondary: '#65676B',
  textMuted: '#8A8D91',
  
  onlineBadge: '#31A24C',
  recordingBadge: '#FA383E',
  videoBadge: '#0084FF',
  
  inputBackground: '#E4E6EB',
  inputBorder: 'rgba(0, 0, 0, 0.08)'
};

// Default export for backward compatibility with components using static Colors
export const Colors = DarkTheme;

