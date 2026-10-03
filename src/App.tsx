/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PartyDataProvider, usePartyData } from './context/PartyDataContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { CharacterModal } from './components/CharacterModal';
import { InviteModal } from './components/InviteModal';
import { InvitesHubModal } from './components/InvitesHubModal';
import { ShareCalculatorModal } from './components/ShareCalculatorModal';
import { PartyBuilderModal } from './components/PartyBuilderModal';
import { ThemeSelectorModal } from './components/ThemeSelector';
import { Character } from './types';
import { Shield, Coins } from 'lucide-react';

const MainApp: React.FC = () => {
  const { user, signInWithGoogle, loading: authLoading } = useAuth();
  const { createCharacter, updateCharacter } = usePartyData();
  const { themeConfig } = useTheme();

  // Modals state
  const [isCharModalOpen, setIsCharModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isInvitesHubOpen, setIsInvitesHubOpen] = useState(false);
  const [isPartyBuilderOpen, setIsPartyBuilderOpen] = useState(false);
  const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);
  const [inviteTargetCharacter, setInviteTargetCharacter] = useState<Character | null>(null);

  const handleOpenNewCharModal = () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    setEditingCharacter(null);
    setIsCharModalOpen(true);
  };

  const handleEditChar = (char: Character) => {
    setEditingCharacter(char);
    setIsCharModalOpen(true);
  };

  const handleSaveChar = async (data: Omit<Character, 'id' | 'ownerId' | 'ownerEmail' | 'minShareLevel' | 'maxShareLevel' | 'createdAt' | 'updatedAt'>) => {
    if (editingCharacter) {
      await updateCharacter(editingCharacter.id, data);
    } else {
      await createCharacter(data);
    }
  };

  const handleInviteChar = (char: Character) => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    setInviteTargetCharacter(char);
  };

  const handleOpenPartyBuilder = () => {
    if (!user) {
      signInWithGoogle();
      return;
    }
    setIsPartyBuilderOpen(true);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#060911] flex flex-col items-center justify-center space-y-4">
        <div className="relative flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse border shadow-2xl"
            style={{
              backgroundColor: themeConfig.primaryColor,
              borderColor: themeConfig.secondaryColor,
              boxShadow: `0 0 35px ${themeConfig.primaryColor}60`,
            }}
          >
            <Shield className="w-8 h-8 text-slate-950" />
          </div>
          <div
            className="absolute inset-0 rounded-2xl border-2 animate-ping"
            style={{ borderColor: themeConfig.primaryColor }}
          />
        </div>
        <div className="text-center space-y-1">
          <p
            className="font-gamer font-bold text-base uppercase tracking-widest"
          >
            <span className="text-slate-100">Click</span>
            <span style={{ color: themeConfig.primaryColor }}>Hunt</span>
          </p>
          <p className="text-xs text-slate-400 font-sans">Carregando HUD de Caçadas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <Navbar
        onOpenCharModal={handleOpenNewCharModal}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenInvitesHub={() => setIsInvitesHubOpen(true)}
        onOpenPartyBuilder={handleOpenPartyBuilder}
        onOpenThemeSelector={() => setIsThemeSelectorOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Dashboard
          onOpenCharModal={handleOpenNewCharModal}
          onEditChar={handleEditChar}
          onOpenCalculator={() => setIsCalculatorOpen(true)}
          onOpenPartyBuilder={handleOpenPartyBuilder}
          onInviteChar={handleInviteChar}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span
              className="font-gamer font-bold uppercase tracking-wider text-sm"
            >
              <span className="text-slate-100">Click</span>
              <span style={{ color: themeConfig.primaryColor }}>Hunt</span>
            </span>
            <span>—</span>
            <span className="font-sans">Todos os direitos reservados ao Major</span>
          </div>

          <div className="flex items-center gap-2 font-gamer">
            <Coins className="w-4 h-4 text-amber-400" />
            <span>
              Apoie o dev: doe <strong className="text-amber-300 uppercase">Tibia Coins</strong> para o char{' '}
              <strong className="text-amber-200 font-mono font-bold bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">Eder</strong> (Tibia Global)
            </span>
          </div>
        </div>
      </footer>

      {/* Character Modal (Create/Edit) */}
      <CharacterModal
        isOpen={isCharModalOpen}
        onClose={() => setIsCharModalOpen(false)}
        onSave={handleSaveChar}
        initialData={editingCharacter}
      />

      {/* Direct Party Invite Modal */}
      <InviteModal
        isOpen={!!inviteTargetCharacter}
        targetCharacter={inviteTargetCharacter}
        onClose={() => setInviteTargetCharacter(null)}
      />

      {/* Invites Hub Modal (Sent & Received) */}
      <InvitesHubModal
        isOpen={isInvitesHubOpen}
        onClose={() => setIsInvitesHubOpen(false)}
      />

      {/* Share Experience Calculator Modal */}
      <ShareCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Party Builder Modal (4 or 5 Members) */}
      <PartyBuilderModal
        isOpen={isPartyBuilderOpen}
        onClose={() => setIsPartyBuilderOpen(false)}
      />

      {/* Theme / Color Combinations Modal */}
      <ThemeSelectorModal
        isOpen={isThemeSelectorOpen}
        onClose={() => setIsThemeSelectorOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PartyDataProvider>
          <MainApp />
        </PartyDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
