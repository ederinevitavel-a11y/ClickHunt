import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId =
  | 'cyber-cyan'
  | 'arcane-void'
  | 'toxic-emerald'
  | 'bloodlust-ember'
  | 'tibia-gold'
  | 'neon-synthwave'
  | 'matrix-cyber'
  | 'frost-blizzard'
  | 'solar-plasma'
  | 'phantom-stealth';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  tagline: string;
  primaryColor: string;
  secondaryColor: string;
  accentHex: string;
  previewDots: string[];
  bgCanvas: string;
  glowClass: string;
  borderClass: string;
  btnPrimaryGradient: string;
  btnPrimaryText: string;
  tabActiveBorder: string;
  tabActiveText: string;
}

export const THEMES: Record<ThemeId, ThemeConfig> = {
  'cyber-cyan': {
    id: 'cyber-cyan',
    name: 'Cyber Cyan & Hot Rose',
    tagline: 'Futurista • Valorant & Cyberpunk',
    primaryColor: '#00f0ff',
    secondaryColor: '#f43f5e',
    accentHex: '#00f0ff',
    previewDots: ['#00f0ff', '#3b82f6', '#f43f5e'],
    bgCanvas: '#050813',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(0,240,255,0.4)]',
    borderClass: 'border-cyan-500/50',
    btnPrimaryGradient: 'from-cyan-400 via-cyan-500 to-blue-600',
    btnPrimaryText: 'text-slate-950',
    tabActiveBorder: 'border-cyan-400',
    tabActiveText: 'text-cyan-300 drop-shadow-[0_2px_8px_rgba(0,240,255,0.5)]',
  },
  'arcane-void': {
    id: 'arcane-void',
    name: 'Arcane Void & Astral Sky',
    tagline: 'Místico • League & RPGs Modernos',
    primaryColor: '#c084fc',
    secondaryColor: '#38bdf8',
    accentHex: '#a855f7',
    previewDots: ['#a855f7', '#c084fc', '#38bdf8'],
    bgCanvas: '#090614',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(168,85,247,0.4)]',
    borderClass: 'border-purple-500/50',
    btnPrimaryGradient: 'from-purple-400 via-fuchsia-500 to-indigo-600',
    btnPrimaryText: 'text-white',
    tabActiveBorder: 'border-purple-400',
    tabActiveText: 'text-purple-300 drop-shadow-[0_2px_8px_rgba(168,85,247,0.5)]',
  },
  'toxic-emerald': {
    id: 'toxic-emerald',
    name: 'Toxic Emerald & Cyber Mint',
    tagline: 'Tático • Apex Legends & Stealth',
    primaryColor: '#10b981',
    secondaryColor: '#06b6d4',
    accentHex: '#10b981',
    previewDots: ['#10b981', '#34d399', '#06b6d4'],
    bgCanvas: '#030d09',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(16,185,129,0.4)]',
    borderClass: 'border-emerald-500/50',
    btnPrimaryGradient: 'from-emerald-400 via-teal-500 to-emerald-600',
    btnPrimaryText: 'text-slate-950',
    tabActiveBorder: 'border-emerald-400',
    tabActiveText: 'text-emerald-300 drop-shadow-[0_2px_8px_rgba(16,185,129,0.5)]',
  },
  'bloodlust-ember': {
    id: 'bloodlust-ember',
    name: 'Bloodlust Crimson & Blaze',
    tagline: 'Sombrio • Diablo & Hack-n-Slash',
    primaryColor: '#f43f5e',
    secondaryColor: '#fbbf24',
    accentHex: '#ef4444',
    previewDots: ['#ef4444', '#f43f5e', '#f59e0b'],
    bgCanvas: '#0d0407',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(239,68,68,0.4)]',
    borderClass: 'border-rose-500/50',
    btnPrimaryGradient: 'from-rose-500 via-red-500 to-amber-600',
    btnPrimaryText: 'text-white',
    tabActiveBorder: 'border-rose-500',
    tabActiveText: 'text-rose-400 drop-shadow-[0_2px_8px_rgba(244,63,94,0.5)]',
  },
  'tibia-gold': {
    id: 'tibia-gold',
    name: 'Imperial Tibia Gold & Iron',
    tagline: 'Clássico Remasterizado • Ouro & Aço',
    primaryColor: '#f59e0b',
    secondaryColor: '#06b6d4',
    accentHex: '#f59e0b',
    previewDots: ['#f59e0b', '#fbbf24', '#06b6d4'],
    bgCanvas: '#060911',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(245,158,11,0.4)]',
    borderClass: 'border-amber-500/50',
    btnPrimaryGradient: 'from-amber-400 via-amber-500 to-yellow-600',
    btnPrimaryText: 'text-slate-950',
    tabActiveBorder: 'border-amber-400',
    tabActiveText: 'text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]',
  },
  'neon-synthwave': {
    id: 'neon-synthwave',
    name: 'Synthwave Sunset & Magenta',
    tagline: 'Retrowave • Neon Pink & Sunset Orange',
    primaryColor: '#ff2a85',
    secondaryColor: '#ff9f1c',
    accentHex: '#ff2a85',
    previewDots: ['#ff2a85', '#ff9f1c', '#a855f7'],
    bgCanvas: '#0c0512',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(255,42,133,0.4)]',
    borderClass: 'border-pink-500/50',
    btnPrimaryGradient: 'from-pink-500 via-rose-500 to-orange-500',
    btnPrimaryText: 'text-white',
    tabActiveBorder: 'border-pink-500',
    tabActiveText: 'text-pink-300 drop-shadow-[0_2px_8px_rgba(255,42,133,0.5)]',
  },
  'matrix-cyber': {
    id: 'matrix-cyber',
    name: 'Matrix Neon & Acid Green',
    tagline: 'Cyber Terminal • Acid Lime & High-tech',
    primaryColor: '#39ff14',
    secondaryColor: '#00ffff',
    accentHex: '#39ff14',
    previewDots: ['#39ff14', '#22c55e', '#00ffff'],
    bgCanvas: '#030a04',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(57,255,20,0.4)]',
    borderClass: 'border-lime-500/50',
    btnPrimaryGradient: 'from-lime-400 via-green-500 to-emerald-600',
    btnPrimaryText: 'text-slate-950',
    tabActiveBorder: 'border-lime-400',
    tabActiveText: 'text-lime-300 drop-shadow-[0_2px_8px_rgba(57,255,20,0.5)]',
  },
  'frost-blizzard': {
    id: 'frost-blizzard',
    name: 'Glacial Frost & Ice Titan',
    tagline: 'Gélido • Ice Cyan & Blizzard Cobalt',
    primaryColor: '#38bdf8',
    secondaryColor: '#818cf8',
    accentHex: '#0284c7',
    previewDots: ['#38bdf8', '#60a5fa', '#818cf8'],
    bgCanvas: '#040914',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(56,189,248,0.4)]',
    borderClass: 'border-sky-500/50',
    btnPrimaryGradient: 'from-sky-400 via-blue-500 to-indigo-600',
    btnPrimaryText: 'text-slate-950',
    tabActiveBorder: 'border-sky-400',
    tabActiveText: 'text-sky-300 drop-shadow-[0_2px_8px_rgba(56,189,248,0.5)]',
  },
  'solar-plasma': {
    id: 'solar-plasma',
    name: 'Solar Plasma & Warmind Gold',
    tagline: 'Energia Solar • Hiper Orange & Dourado',
    primaryColor: '#f97316',
    secondaryColor: '#eab308',
    accentHex: '#ea580c',
    previewDots: ['#f97316', '#fb923c', '#eab308'],
    bgCanvas: '#0d0602',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(249,115,22,0.4)]',
    borderClass: 'border-orange-500/50',
    btnPrimaryGradient: 'from-orange-500 via-amber-500 to-yellow-500',
    btnPrimaryText: 'text-slate-950',
    tabActiveBorder: 'border-orange-500',
    tabActiveText: 'text-orange-300 drop-shadow-[0_2px_8px_rgba(249,115,22,0.5)]',
  },
  'phantom-stealth': {
    id: 'phantom-stealth',
    name: 'Stealth Carbon & Diamond White',
    tagline: 'Ultra Clean Gamer • Titânio & Minimalismo',
    primaryColor: '#f8fafc',
    secondaryColor: '#38bdf8',
    accentHex: '#94a3b8',
    previewDots: ['#ffffff', '#94a3b8', '#38bdf8'],
    bgCanvas: '#08090c',
    glowClass: 'shadow-[0_0_25px_-5px_rgba(255,255,255,0.3)]',
    borderClass: 'border-slate-500/50',
    btnPrimaryGradient: 'from-slate-100 via-slate-200 to-slate-400',
    btnPrimaryText: 'text-slate-950',
    tabActiveBorder: 'border-slate-200',
    tabActiveText: 'text-white drop-shadow-[0_2px_8px_rgba(255,255,255,0.6)]',
  },
};

interface ThemeContextType {
  theme: ThemeId;
  themeConfig: ThemeConfig;
  setTheme: (id: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem('missclick_theme') as ThemeId;
      if (saved && THEMES[saved]) return saved;
    } catch {
      // Ignore
    }
    return 'cyber-cyan';
  });

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('missclick_theme', newTheme);
    } catch {
      // Ignore
    }
  };

  const themeConfig = THEMES[theme] || THEMES['cyber-cyan'];

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeConfig, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
