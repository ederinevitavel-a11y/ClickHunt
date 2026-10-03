import React, { useState } from 'react';
import {
  X,
  Users,
  Target,
  Clock,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePartyData } from '../context/PartyDataContext';
import { POPULAR_HUNTS, POPULAR_WORLDS } from '../lib/tibiaMath';
import { playClickSound, playChimeSound } from '../lib/soundEffects';

interface PartyBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartyBuilderModal: React.FC<PartyBuilderModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { selectedCharacter, createParty } = usePartyData();

  const [targetSize, setTargetSize] = useState<4 | 5>(4);
  const [huntTarget, setHuntTarget] = useState('Soul War - Crater');
  const [scheduledTime, setScheduledTime] = useState('Hoje às 21:00');
  const [world] = useState('Kalibra');
  const [notes, setNotes] = useState('Loot split proporcional, Discord obrigatório.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Autentique-se com Google para criar uma party.');
      return;
    }
    if (!selectedCharacter) {
      setErrorMsg('Selecione ou cadastre seu personagem líder antes de criar a party.');
      return;
    }
    if (!huntTarget.trim()) {
      setErrorMsg('Informe o local da hunt.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await createParty({
        targetSize,
        huntTarget: huntTarget.trim(),
        scheduledTime: scheduledTime.trim(),
        world: 'Kalibra',
        notes: notes.trim(),
      });
      playChimeSound();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao criar party.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div
        className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-500" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-gamer font-bold text-lg sm:text-xl text-slate-100 uppercase tracking-wide">
                Criar Nova Party de Hunt
              </h2>
              <p className="text-xs text-slate-400 font-sans">Monte um grupo de 4 ou 5 membros para caçada</p>
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

        {/* Selected Leader Info */}
        {selectedCharacter && (
          <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between text-xs font-gamer">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 uppercase">Líder da Party:</span>
              <span className="font-bold text-amber-400">{selectedCharacter.characterName}</span>
              <span className="text-slate-500">({selectedCharacter.vocation} Lv.{selectedCharacter.level})</span>
            </div>
            <span className="text-cyan-400 font-mono font-bold uppercase">Kalibra</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-sans">
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-gamer">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Target Party Size (4 or 5) */}
          <div>
            <label className="block font-gamer text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
              Formato da Party (Tamanho)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setTargetSize(4);
                }}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                  targetSize === 4
                    ? 'bg-amber-500/20 border-amber-500/70 ring-2 ring-amber-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-gamer font-bold text-sm text-amber-300 uppercase">PT 4 Integrantes</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    +100% EXP
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  Clássica Quad-Voc: EK (Blocker) + ED (Healer) + MS (Mago) + RP (Paladino).
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound();
                  setTargetSize(5);
                }}
                className={`p-4 rounded-xl border text-left flex flex-col justify-between transition cursor-pointer ${
                  targetSize === 5
                    ? 'bg-amber-500/20 border-amber-500/70 ring-2 ring-amber-500/30'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-gamer font-bold text-sm text-amber-300 uppercase">PT 5 Integrantes</span>
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    META EXP
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  Quad-Voc + Monk / 2nd Blocker / 2nd Shooter para hunts pesadas ou bosses.
                </p>
              </button>
            </div>
          </div>

          {/* World / Server */}
          <div>
            <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
              Servidor / Mundo da Party
            </label>
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl shadow-inner">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-gamer font-bold text-base text-slate-100 uppercase tracking-wider">
                  Kalibra
                </span>
              </div>
              <span className="text-[10px] font-gamer font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Servidor Oficial
              </span>
            </div>
          </div>

          {/* Hunt Target */}
          <div>
            <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
              <Target className="w-3.5 h-3.5 text-rose-400" />
              Local / Objetivo da Hunt
            </label>
            <input
              type="text"
              required
              list="party-hunts-list"
              value={huntTarget}
              onChange={(e) => setHuntTarget(e.target.value)}
              placeholder="Ex: Soul War Crater, Library Fire, Nagás"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500 shadow-inner"
            />
            <datalist id="party-hunts-list">
              {POPULAR_HUNTS.map((h) => (
                <option key={h} value={h} />
              ))}
            </datalist>
          </div>

          {/* Horário */}
          <div>
            <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Horário Planejado / Período
            </label>
            <input
              type="text"
              required
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              placeholder="Ex: das 20h - 23h, Hoje às 21:00, Sábado 16h - 18h"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500 shadow-inner"
            />
            {/* Quick shortcuts */}
            <div className="flex items-center gap-1.5 flex-wrap pt-2">
              <span className="text-[10px] text-slate-500 font-sans">Atalhos rápidos:</span>
              {['das 20h - 23h', 'das 19h - 22h', 'das 21h - 00h', 'das 22h - 02h'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setScheduledTime(preset);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition cursor-pointer ${
                    scheduledTime === preset
                      ? 'bg-amber-500/25 text-amber-300 border-amber-500/50'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Notes / Loot Split */}
          <div>
            <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Regras e Notas (Loot, Waste, Voice)
            </label>
            <textarea
              maxLength={250}
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Loot split igualitário com Tibia-Stats, pot do blocker pago, discord na sala da guild."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 resize-none shadow-inner"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="gamer-btn-secondary px-4 py-2 rounded-xl text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedCharacter}
              className="gamer-btn-primary px-5 py-2.5 rounded-xl text-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Criando Party...' : 'Criar Party no Radar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
