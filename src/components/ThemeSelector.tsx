import React from 'react';
import { Palette, Check, X, Sparkles } from 'lucide-react';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';
import { playClickSound, playChimeSound } from '../lib/soundEffects';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme, themeConfig } = useTheme();

  if (!isOpen) return null;

  const handleSelect = (id: ThemeId) => {
    playChimeSound();
    setTheme(id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Dynamic Gradient */}
        <div
          className="h-1.5 w-full transition-all duration-300 shrink-0"
          style={{
            background: `linear-gradient(90deg, ${themeConfig.primaryColor}, ${themeConfig.secondaryColor}, #a855f7)`,
          }}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              className="p-2 sm:p-2.5 rounded-xl border transition-all duration-300 shrink-0"
              style={{
                backgroundColor: `${themeConfig.primaryColor}20`,
                borderColor: `${themeConfig.primaryColor}40`,
                color: themeConfig.primaryColor,
              }}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-gamer font-bold text-base sm:text-xl text-slate-100 uppercase tracking-wide">
                  Cores da Interface
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  10 Temas
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-sans">
                Selecione o esquema de cores neon da interface
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Theme Spotlight Preview */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: themeConfig.primaryColor }} />
            <span className="text-slate-400 font-gamer uppercase tracking-wide text-[11px]">Atual:</span>
            <span className="font-gamer font-bold text-slate-100 uppercase" style={{ color: themeConfig.primaryColor }}>
              {themeConfig.name}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-sans hidden xs:inline">
            Troca instantânea ao clicar
          </span>
        </div>

        {/* List of Themes */}
        <div className="p-4 sm:p-5 space-y-2.5 flex-1 overflow-y-auto font-sans">
          {Object.values(THEMES).map((th) => {
            const isSelected = theme === th.id;
            return (
              <button
                key={th.id}
                onClick={() => handleSelect(th.id)}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800/90 shadow-lg'
                    : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
                style={{
                  borderColor: isSelected ? `${th.primaryColor}90` : undefined,
                  boxShadow: isSelected ? `0 0 20px -5px ${th.primaryColor}50` : undefined,
                }}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {/* Color dots preview with glow */}
                  <div className="flex -space-x-1.5 items-center shrink-0">
                    {th.previewDots.map((dot, idx) => (
                      <span
                        key={idx}
                        className="w-5 h-5 rounded-full border-2 border-slate-900 shadow-md shrink-0 transition-transform group-hover:scale-110"
                        style={{
                          backgroundColor: dot,
                          boxShadow: isSelected && idx === 0 ? `0 0 10px ${dot}` : undefined,
                        }}
                      />
                    ))}
                  </div>

                  <div className="min-w-0">
                    <div className="font-gamer font-bold text-sm text-slate-100 tracking-wide uppercase flex items-center gap-2">
                      <span className="truncate">{th.name}</span>
                      {isSelected && (
                        <span
                          className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0"
                          style={{
                            color: th.primaryColor,
                            borderColor: `${th.primaryColor}60`,
                            backgroundColor: `${th.primaryColor}20`,
                          }}
                        >
                          ATIVO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-sans truncate">{th.tagline}</p>
                  </div>
                </div>

                <div className="shrink-0 ml-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center border transition"
                    style={{
                      backgroundColor: isSelected ? th.primaryColor : '#0f172a',
                      borderColor: isSelected ? th.primaryColor : '#334155',
                      color: isSelected ? '#020617' : 'transparent',
                    }}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="font-gamer uppercase text-[11px]">Tema salvo automaticamente no seu perfil</span>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="gamer-btn-primary px-5 py-2 rounded-xl text-xs cursor-pointer"
          >
            Pronto
          </button>
        </div>
      </div>
    </div>
  );
};
