export interface ThemePalette {
  isDark: boolean;
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;

  primary: string;      // Amrutam green — Ayurveda brand register
  primaryDark: string;
  primarySoft: string;
  accent: string;       // turmeric gold — CTAs, highlights
  accentSoft: string;

  text: string;
  textMuted: string;
  textInverse: string;

  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
}

export const LightTheme: ThemePalette = {
  isDark: false,
  background: '#F6F7F3',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF3EA',
  border: '#E3E6DE',

  primary: '#1F6E43',
  primaryDark: '#134A2C',
  primarySoft: '#E4F2E9',
  accent: '#C79A3E',
  accentSoft: '#F5EBD3',

  text: '#151B14',
  textMuted: '#66705F',
  textInverse: '#FFFFFF',

  success: '#2F8A3B',
  successSoft: '#E3F2E5',
  warning: '#C08A2E',
  warningSoft: '#F6EBD8',
  danger: '#B23B33',
  dangerSoft: '#F5DEDC',
  info: '#3979C8',
  infoSoft: '#E1EAF6',
};

export const DarkTheme: ThemePalette = {
  isDark: true,
  background: '#0F130F',
  surface: '#1A1F19',
  surfaceAlt: '#232B22',
  border: 'rgba(255,255,255,0.08)',

  primary: '#3FA968',
  primaryDark: '#1F6E43',
  primarySoft: 'rgba(63,169,104,0.14)',
  accent: '#D9AE55',
  accentSoft: 'rgba(217,174,85,0.14)',

  text: '#EDF1EA',
  textMuted: '#9AA598',
  textInverse: '#0F130F',

  success: '#3FA968',
  successSoft: 'rgba(63,169,104,0.14)',
  warning: '#D9AE55',
  warningSoft: 'rgba(217,174,85,0.14)',
  danger: '#E0655C',
  dangerSoft: 'rgba(224,101,92,0.14)',
  info: '#5B9BD5',
  infoSoft: 'rgba(91,155,213,0.14)',
};
