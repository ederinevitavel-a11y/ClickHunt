import React, { useState } from 'react';
import {
  Shield,
  Calculator,
  Bell,
  PlusCircle,
  LogIn,
  LogOut,
  ChevronDown,
  Volume2,
  VolumeX,
  Swords,
  Users,
  Palette,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePartyData } from '../context/PartyDataContext';
import { useTheme } from '../context/ThemeContext';
import { VOCATION_META } from '../lib/tibiaMath';
import { isSoundEnabled, setSoundEnabled, playClickSound } from '../lib/soundEffects';

interface NavbarProps {
  onOpenCharModal: () => void;
  onOpenCalculator: () => void;
  onOpenInvitesHub: () => void;
  onOpenPartyBuilder: () => void;
  onOpenThemeSelector: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCharModal,
  onOpenCalculator,
  onOpenInvitesHub,
  onOpenPartyBuilder,
  onOpenThemeSelector,
}) => {
  const { user, signInWithGoogle, logout } = useAuth();
  const { myCharacters, selectedCharacter, setSelectedCharacter, receivedInvites } = usePartyData();
  const { themeConfig } = useTheme();
  const [showCharDropdown, setShowCharDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [soundOn, setSoundOn] = useState<boolean>(isSoundEnabled());

  const pendingInvitesCount = receivedInvites.filter((inv) => inv.status === 'pending').length;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClickSound();
  };

  const handleAction = (cb: () => void) => {
    playClickSound();
    cb();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      {/* Top Gamer Ambient Neon Accent Line */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${themeConfig.primaryColor}, ${themeConfig.secondaryColor}, transparent)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand / Logo Zone (Clean 1-line display wordmark) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <img
            src="https://i.imgur.com/qOkoaTJ.png"
            alt="Logo"
            className="w-10 h-10 sm:w-14 sm:h-14 object-contain shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-gamer font-bold text-lg sm:text-2xl tracking-wider uppercase">
                <span className="text-slate-100">Click</span>
                <span style={{ color: themeConfig.primaryColor }}>Hunt</span>
              </span>
              <span
                className="hidden xs:inline-block text-[10px] font-gamer font-bold tracking-widest px-2 py-0.5 rounded border uppercase"
                style={{
                  color: themeConfig.primaryColor,
                  borderColor: `${themeConfig.primaryColor}50`,
                  backgroundColor: `${themeConfig.primaryColor}20`,
                }}
              >
                Kalibra
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & User Zone */}
        <div className="flex items-center gap-2">
          {/* Theme / Color Combinations Button */}
          <button
            onClick={() => handleAction(onOpenThemeSelector)}
            className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 bg-slate-900/80 hover:bg-slate-800 border rounded-xl text-xs font-gamer font-semibold text-slate-300 transition cursor-pointer"
            style={{
              borderColor: `${themeConfig.primaryColor}50`,
            }}
            title="Mudar combinação de cores gamer (10 temas disponíveis)"
          >
            <Palette className="w-4 h-4 shrink-0" style={{ color: themeConfig.primaryColor }} />
            <span className="hidden sm:inline uppercase text-[11px] font-bold" style={{ color: themeConfig.primaryColor }}>
              Cores
            </span>
            <div className="flex -space-x-1 items-center ml-0.5 hidden xs:flex">
              {themeConfig.previewDots.slice(0, 3).map((dot, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border border-slate-900 shadow-sm"
                  style={{ backgroundColor: dot }}
                />
              ))}
            </div>
          </button>

          {/* Sound FX Toggle Button */}
          <button
            onClick={toggleSound}
            className="p-2 text-slate-400 hover:text-amber-400 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-xl transition cursor-pointer"
            title={soundOn ? 'Sons do jogo ativados (Clique para silenciar)' : 'Sons do jogo silenciados (Clique para ativar)'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Quick Share Calculator */}
          <button
            onClick={() => handleAction(onOpenCalculator)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-gamer font-semibold text-slate-300 hover:text-amber-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/40 rounded-xl transition cursor-pointer"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase">Calculadora Share</span>
          </button>

          {/* Party Builder shortcut */}
          <button
            onClick={() => handleAction(onOpenPartyBuilder)}
            className="hidden sm:flex gamer-btn-secondary items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl cursor-pointer"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase">Montar PT</span>
          </button>

          {/* Invites Hub Bell */}
          {user && (
            <button
              onClick={() => handleAction(onOpenInvitesHub)}
              className="relative p-2 text-slate-300 hover:text-amber-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition cursor-pointer"
              title="Convites de Party"
            >
              <Bell className="w-4 h-4" />
              {pendingInvitesCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-4 h-4 px-1 text-[10px] font-mono font-bold text-white bg-rose-600 rounded-full animate-pulse shadow-lg shadow-rose-600/50">
                  {pendingInvitesCount}
                </span>
              )}
            </button>
          )}

          {/* Active Character Selector (if logged in) */}
          {user && (
            <div className="relative">
              <button
                onClick={() => {
                  playClickSound();
                  setShowCharDropdown(!showCharDropdown);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 hover:border-amber-500/50 rounded-xl text-xs transition cursor-pointer shadow-inner"
              >
                {selectedCharacter ? (
                  <>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-gamer font-bold border ${
                        VOCATION_META[selectedCharacter.vocation]?.accentColor || 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {VOCATION_META[selectedCharacter.vocation]?.badge || selectedCharacter.vocation}
                    </span>
                    <span className="font-gamer font-semibold text-slate-200 max-w-[90px] sm:max-w-[120px] truncate">
                      {selectedCharacter.characterName}
                    </span>
                    <span className="text-amber-400 font-mono font-bold hidden sm:inline">
                      Lv.{selectedCharacter.level}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1 font-gamer text-xs">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Nenhum Char</span>
                  </span>
                )}
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showCharDropdown && (
                <div
                  className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs"
                  onClick={() => setShowCharDropdown(false)}
                >
                  <div className="px-3 py-1.5 border-b border-slate-800 text-slate-400 font-gamer font-bold uppercase tracking-wider text-[10px]">
                    Seus Personagens
                  </div>

                  {myCharacters.length === 0 ? (
                    <div className="px-3 py-3 text-center text-slate-400 font-gamer">
                      Nenhum personagem cadastrado.
                    </div>
                  ) : (
                    myCharacters.map((char) => {
                      const meta = VOCATION_META[char.vocation];
                      const isSelected = selectedCharacter?.id === char.id;
                      return (
                        <button
                          key={char.id}
                          onClick={() => {
                            playClickSound();
                            setSelectedCharacter(char);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-800 transition cursor-pointer ${
                            isSelected ? 'bg-slate-800/80 border-l-2 border-amber-400' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-gamer font-bold border ${meta?.accentColor}`}>
                              {meta?.badge}
                            </span>
                            <div className="truncate">
                              <div className="font-gamer font-semibold text-slate-200 truncate">{char.characterName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                Kalibra • Share: {char.minShareLevel} - {char.maxShareLevel}
                              </div>
                            </div>
                          </div>
                          <span className="text-amber-400 font-mono font-bold ml-2 shrink-0">Lv.{char.level}</span>
                        </button>
                      );
                    })
                  )}

                  <div className="p-2 border-t border-slate-800">
                    <button
                      onClick={() => handleAction(onOpenCharModal)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-gamer font-bold uppercase rounded-lg transition cursor-pointer shadow"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>Cadastrar Novo Char</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Profile / Auth State */}
          {!user ? (
            <button
              onClick={() => handleAction(signInWithGoogle)}
              className="gamer-btn-primary flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login Google</span>
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => {
                  playClickSound();
                  setShowUserDropdown(!showUserDropdown);
                }}
                className="flex items-center gap-1.5 p-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-full transition cursor-pointer"
                title={user.email || 'Conta Google'}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {showUserDropdown && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs"
                  onClick={() => setShowUserDropdown(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-gamer font-bold text-slate-200 truncate">{user.displayName || 'Gamer Tibiano'}</p>
                    <p className="text-[11px] text-slate-400 truncate font-mono">{user.email}</p>
                  </div>

                  <button
                    onClick={() => handleAction(onOpenCharModal)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition text-left cursor-pointer font-gamer"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-400" />
                    <span>Cadastrar Personagem</span>
                  </button>

                  <button
                    onClick={() => handleAction(onOpenInvitesHub)}
                    className="w-full flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition text-left cursor-pointer font-gamer"
                  >
                    <span className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span>Meus Convites</span>
                    </span>
                    {pendingInvitesCount > 0 && (
                      <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-mono font-bold">
                        {pendingInvitesCount}
                      </span>
                    )}
                  </button>

                  <div className="border-t border-slate-800 mt-1 pt-1">
                    <button
                      onClick={() => handleAction(logout)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-950/30 transition text-left cursor-pointer font-gamer"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair da Conta</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
