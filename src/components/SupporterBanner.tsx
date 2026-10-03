import React, { useState } from 'react';
import { Coins, Copy, Check, Sparkles } from 'lucide-react';
import { playClickSound, playChimeSound } from '../lib/soundEffects';

interface SupporterBannerProps {
  compact?: boolean;
}

export const SupporterBanner: React.FC<SupporterBannerProps> = ({ compact = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    playChimeSound();
    navigator.clipboard.writeText('Eder');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs shadow-sm">
        <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
        <span className="text-slate-300 font-gamer text-xs">
          Apoie o dev:{' '}
          <strong className="text-amber-300 font-semibold uppercase">Doe Tibia Coins</strong> para o char{' '}
          <span className="text-amber-200 font-mono font-bold bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
            Eder
          </span>
        </span>
        <button
          onClick={handleCopy}
          title="Copiar nome do char"
          className="ml-auto flex items-center gap-1 font-gamer text-[11px] font-bold uppercase text-amber-300 hover:text-amber-100 bg-amber-500/20 hover:bg-amber-500/30 px-2 py-0.5 rounded-lg border border-amber-500/30 transition cursor-pointer"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copiado!' : 'Copiar'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/30 border border-amber-500/40 rounded-2xl p-4 sm:p-5 shadow-xl shadow-amber-950/30">
      {/* Tactical Ambient Glow */}
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -left-6 -bottom-6 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Cyber Corner Accent */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-amber-400" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-amber-400" />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0 border border-amber-200/50">
            <Coins className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-gamer font-bold text-xs uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Apoie o Projeto ClickHunt
              </span>
              <span className="text-[10px] font-gamer font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 px-2 py-0.2 rounded-full border border-amber-500/30">
                Tibia Coins
              </span>
            </div>
            <p className="text-sm text-slate-200 mt-1 font-sans">
              Se tiver interesse em apoiar, doe <strong className="text-amber-300 font-bold uppercase">Tibia Coins</strong> para o char{' '}
              <span className="inline-flex items-center font-mono font-black text-amber-200 bg-amber-500/20 border border-amber-500/50 px-2 py-0.5 rounded-lg text-sm shadow-inner">
                Eder
              </span>
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Sua doação garante melhorias e maior dedicação a ferramenta.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={handleCopy}
            className="gamer-btn-primary flex items-center gap-2 px-4 py-2 rounded-xl text-xs cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-slate-950" />
                <span>Char &quot;Eder&quot; Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Char &quot;Eder&quot;</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
