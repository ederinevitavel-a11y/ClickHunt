import React, { useState } from 'react';
import {
  Compass,
  Users,
  Shield,
  PlusCircle,
  Calculator,
  Swords,
  Sparkles,
  Database,
  Radio,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePartyData } from '../context/PartyDataContext';
import { useTheme } from '../context/ThemeContext';
import { Character } from '../types';
import { SmartSuggestions } from './SmartSuggestions';
import { RosterView } from './RosterView';
import { PartyCard } from './PartyCard';
import { SupporterBanner } from './SupporterBanner';
import { AdminPanel } from './AdminPanel';
import { DEMO_CHARACTERS } from '../lib/seedCharacters';
import { playClickSound, playChimeSound } from '../lib/soundEffects';

interface DashboardProps {
  onOpenCharModal: () => void;
  onEditChar: (character: Character) => void;
  onOpenCalculator: () => void;
  onOpenPartyBuilder: () => void;
  onInviteChar: (character: Character) => void;
  activeTab?: 'suggestions' | 'all' | 'parties' | 'admin';
  onTabChange?: (tab: 'suggestions' | 'all' | 'parties' | 'admin') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onOpenCharModal,
  onEditChar,
  onOpenCalculator,
  onOpenPartyBuilder,
  onInviteChar,
  activeTab: controlledActiveTab,
  onTabChange: controlledOnTabChange,
}) => {
  const { user, signInWithGoogle } = useAuth();
  const { themeConfig } = useTheme();
  const {
    characters,
    parties,
    deleteCharacter,
    createCharacter,
    organizedParties,
    isAdmin,
  } = usePartyData();

  const [internalActiveTab, setInternalActiveTab] = useState<'suggestions' | 'all' | 'parties' | 'admin'>('suggestions');
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const [seedingLoading, setSeedingLoading] = useState(false);

  const handleTabChange = (tab: 'suggestions' | 'all' | 'parties' | 'admin') => {
    playClickSound();
    if (controlledOnTabChange) {
      controlledOnTabChange(tab);
    } else {
      setInternalActiveTab(tab);
    }
  };

  const handleSeedDemos = async () => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    setSeedingLoading(true);
    playChimeSound();
    try {
      for (const demo of DEMO_CHARACTERS) {
        if (!characters.some((c) => c.characterName.toLowerCase() === demo.characterName.toLowerCase())) {
          await createCharacter(demo);
        }
      }
    } catch (err) {
      console.error('Error seeding characters:', err);
    } finally {
      setSeedingLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Supporter Notice ("Doe Tibia Coins para o char Eder") */}
      <SupporterBanner />

      {/* Main Modern Gamer Tabs (Hidden on mobile, shown on tablet/desktop) */}
      <div className="hidden sm:flex border-b border-slate-800 gap-1 sm:gap-2 font-gamer overflow-x-auto whitespace-nowrap scrollbar-none">
        {/* Tab 1: Sugestões Inteligentes */}
        <button
          onClick={() => handleTabChange('suggestions')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition cursor-pointer tracking-wider uppercase ${
            activeTab === 'suggestions'
              ? `${themeConfig.tabActiveBorder} ${themeConfig.tabActiveText}`
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Compass className="w-4 h-4" style={{ color: themeConfig.primaryColor }} />
          <span>Sugestão Automática</span>
          <span
            className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 rounded border"
            style={{
              color: themeConfig.primaryColor,
              borderColor: `${themeConfig.primaryColor}40`,
              backgroundColor: `${themeConfig.primaryColor}15`,
            }}
          >
            SMART MATCH
          </span>
        </button>

        {/* Tab 2: Todos os Jogadores */}
        <button
          onClick={() => handleTabChange('all')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition cursor-pointer tracking-wider uppercase ${
            activeTab === 'all'
              ? `${themeConfig.tabActiveBorder} ${themeConfig.tabActiveText}`
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" style={{ color: themeConfig.primaryColor }} />
          <span>Todos os Chars</span>
          <span className="text-xs text-slate-400 font-mono">({characters.length})</span>
        </button>

        {/* Tab 3: Party Ativas (4 ou 5 membros) */}
        <button
          onClick={() => handleTabChange('parties')}
          className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition cursor-pointer tracking-wider uppercase ${
            activeTab === 'parties'
              ? `${themeConfig.tabActiveBorder} ${themeConfig.tabActiveText}`
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Swords className="w-4 h-4" style={{ color: themeConfig.primaryColor }} />
          <span>Party Ativas</span>
          <span className="text-xs text-slate-400 font-mono">({parties.length})</span>
        </button>

        {/* Tab 4: Sessão Admin (Apenas se for Admin) */}
        {isAdmin && (
          <button
            onClick={() => handleTabChange('admin')}
            className={`flex items-center gap-2 py-3 px-4 text-sm font-bold border-b-2 transition cursor-pointer tracking-wider uppercase ${
              activeTab === 'admin'
                ? `${themeConfig.tabActiveBorder} ${themeConfig.tabActiveText}`
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>Sessão Admin</span>
            <span className="text-xs text-slate-400 font-mono">({organizedParties.length})</span>
          </button>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === 'suggestions' && (
        <SmartSuggestions
          onInvite={onInviteChar}
          onOpenCharModal={onOpenCharModal}
          onDelete={deleteCharacter}
        />
      )}

      {activeTab === 'all' && (
        <RosterView
          onInvite={onInviteChar}
          onEdit={onEditChar}
          onDelete={deleteCharacter}
          onOpenCharModal={onOpenCharModal}
        />
      )}

      {activeTab === 'parties' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-gamer font-bold text-base text-slate-200 flex items-center gap-2 uppercase tracking-wide">
                <Swords className="w-4 h-4 text-amber-400" />
                Grupos de Caçada em Formação (4 ou 5 Integrantes)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                Veja as parties abertas no seu servidor, confira os slots de vocações e entre com 1 clique!
              </p>
            </div>

            <button
              onClick={() => {
                playClickSound();
                onOpenPartyBuilder();
              }}
              className="gamer-btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs cursor-pointer self-start sm:self-center"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Criar Nova PT</span>
            </button>
          </div>

          {parties.length === 0 ? (
            <div className="hud-panel rounded-2xl p-12 text-center space-y-4">
              <Users className="w-12 h-12 mx-auto text-slate-600" />
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-gamer font-bold text-lg text-slate-200 uppercase">
                  Nenhuma Party Aberta no Momento
                </h3>
                <p className="text-xs text-slate-400 font-sans">
                  Seja o líder da hunt! Crie uma party para 4 membros (Quad-Voc +100% EXP) ou 5 membros para bosses e hunts desafiadoras.
                </p>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  onOpenPartyBuilder();
                }}
                className="gamer-btn-primary px-5 py-2.5 rounded-xl text-xs cursor-pointer"
              >
                Montar Primeira PT
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {parties.map((party) => (
                <PartyCard key={party.id} party={party} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'admin' && isAdmin && (
        <AdminPanel />
      )}
    </div>
  );
};
