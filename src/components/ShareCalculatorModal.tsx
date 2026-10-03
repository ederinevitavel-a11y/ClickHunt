import React, { useState } from 'react';
import {
  X,
  Calculator,
  Shield,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
} from 'lucide-react';
import { calculateShareRange, canPartyShare } from '../lib/tibiaMath';
import { playClickSound, playChimeSound } from '../lib/soundEffects';

interface ShareCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLevel?: number;
}

export const ShareCalculatorModal: React.FC<ShareCalculatorModalProps> = ({
  isOpen,
  onClose,
  defaultLevel = 450,
}) => {
  const [singleLevel, setSingleLevel] = useState<number>(defaultLevel);
  const [partyLevels, setPartyLevels] = useState<number[]>([450, 420, 480, 435]);
  const [newLevelInput, setNewLevelInput] = useState<number>(400);

  if (!isOpen) return null;

  const { minShareLevel, maxShareLevel } = calculateShareRange(singleLevel);
  const partyShareResult = canPartyShare(partyLevels);

  const addPartyMember = () => {
    if (partyLevels.length >= 5) return;
    if (newLevelInput >= 1 && newLevelInput <= 3000) {
      playClickSound();
      setPartyLevels([...partyLevels, newLevelInput]);
    }
  };

  const removePartyMember = (index: number) => {
    playClickSound();
    setPartyLevels(partyLevels.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Gamer Ambient Line */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md shadow-amber-500/15">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-gamer font-bold text-lg sm:text-xl text-slate-100 uppercase tracking-wide">
                Calculadora Share Experience Tibia
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Fórmula oficial: ceil(Lv * 2/3) até floor(Lv * 1.5)
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Single Level Calculator */}
          <div className="hud-panel rounded-2xl p-5 space-y-4">
            <h3 className="font-gamer font-bold text-sm text-amber-400 flex items-center gap-2 uppercase tracking-wide">
              <Shield className="w-4 h-4 text-amber-400" />
              1. Faixa de Share Individual
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-full sm:w-1/3">
                <label className="block font-gamer text-xs font-bold text-slate-300 mb-1 uppercase tracking-wide">
                  Digite seu Level:
                </label>
                <input
                  type="number"
                  min={1}
                  max={3000}
                  value={singleLevel}
                  onChange={(e) => setSingleLevel(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xl font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-500 transition shadow-inner"
                />
              </div>

              <div className="w-full sm:w-2/3 grid grid-cols-2 gap-3">
                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="font-gamer text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                    Nível Mínimo
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                    Lv. {minShareLevel}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">ceil(Lv * 2/3)</span>
                </div>

                <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-center">
                  <span className="font-gamer text-[11px] text-slate-400 block font-bold uppercase tracking-wider">
                    Nível Máximo
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-mono text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                    Lv. {maxShareLevel}
                  </span>
                  <span className="text-[10px] text-slate-500 block font-mono">floor(Lv * 1.5)</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 font-sans">
              No level <strong className="text-amber-300 font-mono">Lv. {singleLevel}</strong>, sua party terá Share Ativo com qualquer jogador entre o nível <strong className="text-amber-300 font-mono">Lv. {minShareLevel}</strong> e <strong className="text-amber-300 font-mono">Lv. {maxShareLevel}</strong>.
            </div>
          </div>

          {/* Section 2: Group Party Share Simulation */}
          <div className="hud-panel rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-gamer font-bold text-sm text-amber-400 flex items-center gap-2 uppercase tracking-wide">
                <Sparkles className="w-4 h-4 text-amber-400" />
                2. Simulador de Party Completa (4 ou 5 Membros)
              </h3>
              <span className="text-xs text-slate-400 font-mono font-bold">
                {partyLevels.length}/5 INTEGRANTES
              </span>
            </div>

            {/* Party Members list */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {partyLevels.map((lvl, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-between"
                >
                  <span className="font-gamer text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Slot #{idx + 1}
                  </span>
                  <span className="text-xl font-black font-mono text-slate-100 my-1">
                    Lv. {lvl}
                  </span>
                  {partyLevels.length > 2 && (
                    <button
                      onClick={() => removePartyMember(idx)}
                      className="text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      title="Remover integrante"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {/* Add member slot */}
              {partyLevels.length < 5 && (
                <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={3000}
                    value={newLevelInput}
                    onChange={(e) => setNewLevelInput(parseInt(e.target.value) || 1)}
                    className="w-16 px-1.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-center text-xs font-mono font-bold text-amber-300"
                  />
                  <button
                    onClick={addPartyMember}
                    className="gamer-btn-secondary px-2.5 py-1 rounded-lg text-[10px] cursor-pointer"
                  >
                    + Add Slot
                  </button>
                </div>
              )}
            </div>

            {/* Verdict Box */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                partyShareResult.isShareActive
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}
            >
              {partyShareResult.isShareActive ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="font-gamer font-bold text-sm tracking-wide uppercase">
                  {partyShareResult.isShareActive
                    ? 'SHARE EXPERIÊNCIA ATIVO! (+ Bônus de Party Garantido)'
                    : 'SHARE INATIVO (Diferença de Nível Excedida!)'}
                </div>
                <div className="text-xs leading-relaxed font-sans">
                  {partyShareResult.isShareActive ? (
                    <span>
                      O menor membro é <strong className="font-mono">Lv. {partyShareResult.minLevel}</strong> e o maior é{' '}
                      <strong className="font-mono">Lv. {partyShareResult.maxLevel}</strong>. O menor nível precisava ser ao menos{' '}
                      <strong className="font-mono">{partyShareResult.requiredMinLevel}</strong>, portanto todos recebem exp compartilhada com sucesso!
                    </span>
                  ) : (
                    <span>
                      O maior membro é <strong className="font-mono">Lv. {partyShareResult.maxLevel}</strong>, o que exige que o menor nível da PT seja ao menos{' '}
                      <strong className="font-mono">Lv. {partyShareResult.requiredMinLevel}</strong>. Seu menor membro está no{' '}
                      <strong className="font-mono">Lv. {partyShareResult.minLevel}</strong>.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tibia Party Bonus Breakdown */}
            <div className="border-t border-slate-800 pt-3">
              <span className="font-gamer text-xs font-bold text-slate-300 uppercase tracking-wide block mb-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Bônus de Vocações no Tibia:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px] font-sans">1 Vocação</span>
                  <span className="font-gamer font-bold text-slate-300">+20% EXP</span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px] font-sans">2 Vocações</span>
                  <span className="font-gamer font-bold text-slate-300">+30% EXP</span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-slate-400 block text-[11px] font-sans">3 Vocações</span>
                  <span className="font-gamer font-bold text-amber-400">+60% EXP</span>
                </div>
                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10">
                  <span className="text-amber-400 block text-[11px] font-gamer font-bold">4 Vocações (Quad)</span>
                  <span className="font-gamer font-black text-amber-300 text-sm drop-shadow-[0_2px_8px_rgba(245,158,11,0.5)]">
                    +100% EXP!
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/70 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="gamer-btn-secondary px-5 py-2 rounded-xl text-xs cursor-pointer"
          >
            Fechar Calculadora
          </button>
        </div>
      </div>
    </div>
  );
};
