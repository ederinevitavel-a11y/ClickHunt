import React from 'react';
import {
  Compass,
  Users,
  Swords,
  Calculator,
  PlusCircle,
  Shield,
  Bell,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { playClickSound } from '../lib/soundEffects';

interface MobileBottomNavProps {
  activeTab: 'suggestions' | 'all' | 'parties' | 'admin';
  onTabChange: (tab: 'suggestions' | 'all' | 'parties' | 'admin') => void;
  onOpenPartyBuilder: () => void;
  onOpenCalculator: () => void;
  onOpenCharModal: () => void;
  isAdmin?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenPartyBuilder,
  onOpenCalculator,
  onOpenCharModal,
  isAdmin = false,
}) => {
  const { themeConfig } = useTheme();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/90 shadow-[0_-10px_25px_rgba(0,0,0,0.8)] sm:hidden">
      {/* Dynamic top accent line */}
      <div
        className="h-[1.5px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${themeConfig.primaryColor}, ${themeConfig.secondaryColor}, transparent)`,
        }}
      />

      <div className="grid grid-cols-5 h-16 items-center px-1 font-gamer">
        {/* 1. Radar (Sugestões) */}
        <button
          onClick={() => {
            playClickSound();
            onTabChange('suggestions');
          }}
          className={`flex flex-col items-center justify-center gap-1 h-full transition-all cursor-pointer ${
            activeTab === 'suggestions'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          style={{
            color: activeTab === 'suggestions' ? themeConfig.primaryColor : undefined,
          }}
        >
          <Compass className={`w-5 h-5 ${activeTab === 'suggestions' ? 'scale-110 animate-pulse' : ''}`} />
          <span className="text-[10px] uppercase tracking-wider">Radar</span>
        </button>

        {/* 2. Todos os Chars */}
        <button
          onClick={() => {
            playClickSound();
            onTabChange('all');
          }}
          className={`flex flex-col items-center justify-center gap-1 h-full transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          style={{
            color: activeTab === 'all' ? themeConfig.primaryColor : undefined,
          }}
        >
          <Users className={`w-5 h-5 ${activeTab === 'all' ? 'scale-110' : ''}`} />
          <span className="text-[10px] uppercase tracking-wider">Membros</span>
        </button>

        {/* 3. CENTER ACTION BUTTON: Novo Char ou Montar PT */}
        <div className="flex items-center justify-center -mt-5">
          <button
            onClick={() => {
              playClickSound();
              onOpenCharModal();
            }}
            className="w-13 h-13 rounded-2xl flex flex-col items-center justify-center text-slate-950 shadow-2xl transition transform active:scale-95 cursor-pointer border-2"
            style={{
              backgroundColor: themeConfig.primaryColor,
              borderColor: themeConfig.secondaryColor,
              boxShadow: `0 0 20px ${themeConfig.primaryColor}80`,
            }}
            title="Cadastrar Novo Personagem"
          >
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. Montar PT / Parties */}
        <button
          onClick={() => {
            playClickSound();
            onTabChange('parties');
          }}
          className={`flex flex-col items-center justify-center gap-1 h-full transition-all cursor-pointer ${
            activeTab === 'parties'
              ? 'text-amber-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          style={{
            color: activeTab === 'parties' ? themeConfig.primaryColor : undefined,
          }}
        >
          <Swords className={`w-5 h-5 ${activeTab === 'parties' ? 'scale-110' : ''}`} />
          <span className="text-[10px] uppercase tracking-wider">Parties</span>
        </button>

        {/* 5. Calculadora ou Admin */}
        {isAdmin ? (
          <button
            onClick={() => {
              playClickSound();
              onTabChange('admin');
            }}
            className={`flex flex-col items-center justify-center gap-1 h-full transition-all cursor-pointer ${
              activeTab === 'admin'
                ? 'text-amber-400 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={{
              color: activeTab === 'admin' ? themeConfig.primaryColor : undefined,
            }}
          >
            <Shield className={`w-5 h-5 ${activeTab === 'admin' ? 'scale-110 text-amber-400' : ''}`} />
            <span className="text-[10px] uppercase tracking-wider">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => {
              playClickSound();
              onOpenCalculator();
            }}
            className="flex flex-col items-center justify-center gap-1 h-full text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
          >
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider">Share</span>
          </button>
        )}
      </div>
    </nav>
  );
};
