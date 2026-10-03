import React, { useState, useEffect, useRef } from 'react';
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
  Users,
  Palette,
  Sparkles,
  Settings,
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

  const charDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  const pendingInvitesCount = receivedInvites.filter((inv) => inv.status === 'pending').length;

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) playClickSound();
  };

  const handleAction = (cb: () => void) => {
    playClickSound();
    setShowCharDropdown(false);
    setShowUserDropdown(false);
    cb();
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        charDropdownRef.current &&
        !charDropdownRef.current.contains(event.target as Node)
      ) {
        setShowCharDropdown(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 shadow-2xl">
      {/* Top Gamer Ambient Neon Accent Line */}
      <div
        className="h-[2px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent, ${themeConfig.primaryColor}, ${themeConfig.secondaryColor}, transparent)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Brand / Logo Zone (Compact on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <img
            src="https://i.imgur.com/qOkoaTJ.png"
            alt="Missclick Logo"
            className="w-8 h-8 sm:w-11 sm:h-11 object-contain shrink-0"
          />
          <div>
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-gamer font-bold text-base sm:text-2xl tracking-wider uppercase">
                <span className="text-slate-100">Click</span>
                <span style={{ color: themeConfig.primaryColor }}>Hunt</span>
              </span>
              <span
                className="hidden md:inline-block text-[10px] font-gamer font-bold tracking-widest px-1.5 py-0.2 rounded border uppercase"
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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Theme / Color Combinations Button (Visible on Mobile and Desktop) */}
          <button
            onClick={() => handleAction(onOpenThemeSelector)}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 bg-slate-900/90 hover:bg-slate-800 border rounded-xl text-xs font-gamer font-semibold transition cursor-pointer shrink-0"
            style={{
              borderColor: `${themeConfig.primaryColor}60`,
            }}
            title="Mudar combinação de cores gamer (10 temas)"
          >
            <Palette className="w-3.5 h-3.5 shrink-0" style={{ color: themeConfig.primaryColor }} />
            <span className="uppercase text-[11px] font-bold hidden md:inline" style={{ color: themeConfig.primaryColor }}>
              Cores
            </span>
            <div className="flex -space-x-1 items-center ml-0.5">
              {themeConfig.previewDots.slice(0, 2).map((dot, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full border border-slate-900 shadow-sm"
                  style={{ backgroundColor: dot }}
                />
              ))}
            </div>
          </button>

          {/* Desktop Sound FX Toggle Button */}
          <button
            onClick={toggleSound}
            className="hidden sm:flex p-2 text-slate-400 hover:text-amber-400 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition cursor-pointer shrink-0"
            title={soundOn ? 'Sons ativados (Clique para silenciar)' : 'Sons silenciados (Clique para ativar)'}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Desktop Quick Share Calculator */}
          <button
            onClick={() => handleAction(onOpenCalculator)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-gamer font-semibold text-slate-300 hover:text-amber-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 hover:border-amber-500/40 rounded-xl transition cursor-pointer shrink-0"
          >
            <Calculator className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase">Calculadora Share</span>
          </button>

          {/* Desktop Party Builder shortcut */}
          <button
            onClick={() => handleAction(onOpenPartyBuilder)}
            className="hidden md:flex gamer-btn-secondary items-center gap-1.5 px-3 py-1.5 text-xs rounded-xl cursor-pointer shrink-0"
          >
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase">Montar PT</span>
          </button>

          {/* Invites Hub Bell (Always visible if logged in) */}
          {user && (
            <button
              onClick={() => handleAction(onOpenInvitesHub)}
              className="relative p-1.5 sm:p-2 text-slate-300 hover:text-amber-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition cursor-pointer shrink-0"
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

          {/* Active Character Selector (Compact on mobile) */}
          {user && (
            <div className="relative" ref={charDropdownRef}>
              <button
                onClick={() => {
                  playClickSound();
                  setShowCharDropdown(!showCharDropdown);
                  setShowUserDropdown(false);
                }}
                className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 bg-slate-900/95 hover:bg-slate-800/90 border border-slate-700/80 hover:border-amber-500/50 rounded-xl text-xs transition cursor-pointer shadow-inner max-w-[125px] xs:max-w-[155px] sm:max-w-[200px]"
              >
                {selectedCharacter ? (
                  <>
                    <span
                      className={`px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded text-[9px] sm:text-[10px] font-gamer font-bold border shrink-0 ${
                        VOCATION_META[selectedCharacter.vocation]?.accentColor || 'bg-slate-800 text-slate-200'
                      }`}
                    >
                      {VOCATION_META[selectedCharacter.vocation]?.badge || selectedCharacter.vocation}
                    </span>
                    <span className="font-gamer font-semibold text-slate-200 truncate text-[11px] sm:text-xs">
                      {selectedCharacter.characterName}
                    </span>
                  </>
                ) : (
                  <span className="text-slate-400 flex items-center gap-1 font-gamer text-[11px] sm:text-xs truncate">
                    <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="hidden xs:inline">Nenhum Char</span>
                    <span className="xs:hidden">Char</span>
                  </span>
                )}
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 ml-0.5" />
              </button>

              {/* Dropdown Menu */}
              {showCharDropdown && (
                <div
                  className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-24px)] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs"
                >
                  <div className="px-3 py-1.5 border-b border-slate-800 text-slate-400 font-gamer font-bold uppercase tracking-wider text-[10px]">
                    Seus Personagens
                  </div>

                  {myCharacters.length === 0 ? (
                    <div className="px-3 py-3 text-center text-slate-400 font-gamer">
                      Nenhum personagem cadastrado.
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto">
                      {myCharacters.map((char) => {
                        const meta = VOCATION_META[char.vocation];
                        const isSelected = selectedCharacter?.id === char.id;
                        return (
                          <button
                            key={char.id}
                            onClick={() => {
                              playClickSound();
                              setSelectedCharacter(char);
                              setShowCharDropdown(false);
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
                      })}
                    </div>
                  )}

                  <div className="p-2 border-t border-slate-800">
                    <button
                      onClick={() => handleAction(onOpenCharModal)}
                      className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-gamer font-bold uppercase rounded-lg transition cursor-pointer shadow text-xs"
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
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAction(signInWithGoogle)}
                className="gamer-btn-primary flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-1.5 rounded-xl text-xs cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Login Google</span>
                <span className="xs:hidden">Entrar</span>
              </button>

              {/* Mobile Settings button for guests */}
              <button
                onClick={() => handleAction(onOpenThemeSelector)}
                className="sm:hidden p-1.5 text-slate-400 bg-slate-900/80 border border-slate-800 rounded-xl"
                title="Cores do Tema"
              >
                <Palette className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          ) : (
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => {
                  playClickSound();
                  setShowUserDropdown(!showUserDropdown);
                  setShowCharDropdown(false);
                }}
                className="flex items-center gap-1 p-0.5 sm:p-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-full transition cursor-pointer shrink-0"
                title={user.email || 'Conta Google'}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Avatar'} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                    {user.email?.[0].toUpperCase() || 'U'}
                  </div>
                )}
              </button>

              {showUserDropdown && (
                <div
                  className="absolute right-0 mt-2 w-60 max-w-[calc(100vw-24px)] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs"
                >
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-gamer font-bold text-slate-200 truncate">{user.displayName || 'Gamer Tibiano'}</p>
                    <p className="text-[11px] text-slate-400 truncate font-mono">{user.email}</p>
                  </div>

                  {/* Mobile-only Quick Settings */}
                  <div className="sm:hidden border-b border-slate-800 py-1">
                    <button
                      onClick={() => handleAction(onOpenThemeSelector)}
                      className="w-full flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition text-left cursor-pointer font-gamer"
                    >
                      <span className="flex items-center gap-2">
                        <Palette className="w-4 h-4" style={{ color: themeConfig.primaryColor }} />
                        <span>Cores do HUD ({themeConfig.name})</span>
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        toggleSound();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-amber-300 transition text-left cursor-pointer font-gamer"
                    >
                      <span className="flex items-center gap-2">
                        {soundOn ? <Volume2 className="w-4 h-4 text-amber-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                        <span>Sons do Jogo: <strong className={soundOn ? 'text-emerald-400' : 'text-slate-500'}>{soundOn ? 'Ligados' : 'Desligados'}</strong></span>
                      </span>
                    </button>
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
