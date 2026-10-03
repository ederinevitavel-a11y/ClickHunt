import React, { useState } from 'react';
import {
  X,
  Swords,
  Clock,
  Target,
  MessageSquare,
  Send,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { Character } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePartyData } from '../context/PartyDataContext';
import { buildWhatsAppLink, POPULAR_HUNTS, VOCATION_META } from '../lib/tibiaMath';
import { playClickSound, playTransmissionSound } from '../lib/soundEffects';

interface InviteModalProps {
  targetCharacter: Character | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InviteModal: React.FC<InviteModalProps> = ({
  targetCharacter,
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const { selectedCharacter, myCharacters, setSelectedCharacter, sendPartyInvite } = usePartyData();

  const [huntTarget, setHuntTarget] = useState(targetCharacter?.huntsInterest?.[0] || 'Library - Fire Section');
  const [scheduledTime, setScheduledTime] = useState('Hoje às 21:00');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen || !targetCharacter) return null;

  const targetMeta = VOCATION_META[targetCharacter.vocation];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setErrorMsg('Faça login com Google para convidar.');
      return;
    }
    if (!selectedCharacter) {
      setErrorMsg('Cadastre ou selecione seu personagem antes de enviar um convite.');
      return;
    }
    if (!huntTarget.trim()) {
      setErrorMsg('Informe o local da hunt.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await sendPartyInvite(targetCharacter, huntTarget.trim(), scheduledTime.trim(), message.trim());
      playTransmissionSound();
      setSuccessMsg(`Convite enviado com sucesso para ${targetCharacter.characterName}!`);
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao enviar convite.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const whatsappHref = selectedCharacter && targetCharacter.whatsappNumber
    ? buildWhatsAppLink(
        targetCharacter.whatsappNumber,
        selectedCharacter.characterName,
        selectedCharacter.vocation,
        selectedCharacter.level,
        targetCharacter.characterName,
        huntTarget
      )
    : targetCharacter.whatsappNumber
    ? `https://wa.me/${targetCharacter.whatsappNumber.replace(/\D/g, '')}`
    : null;

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
              <Swords className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-gamer font-bold text-lg sm:text-xl text-slate-100 uppercase tracking-wide">
                Convidar para Party de Hunt
              </h2>
              <p className="text-xs text-slate-400 font-sans">Proponha uma hunt para o jogador</p>
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

        {/* Target Character Preview Card */}
        <div className="p-5 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-gamer font-bold text-sm border shadow-md"
              style={{
                borderColor: `${targetMeta?.hexColor || '#f59e0b'}60`,
                backgroundColor: `${targetMeta?.hexColor || '#f59e0b'}15`,
                color: targetMeta?.textColor.replace('text-', ''),
              }}
            >
              {targetMeta?.badge}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-gamer font-bold text-slate-100 text-base">{targetCharacter.characterName}</span>
                <span className="font-mono text-[10px] font-bold bg-slate-900 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/40 uppercase">
                  Kalibra
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-0.5 font-sans">
                {targetCharacter.vocation} • <span className="text-amber-400 font-bold font-mono">Lv.{targetCharacter.level}</span>
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-400 font-gamer">
            <div className="uppercase">Share XP:</div>
            <div className="font-mono text-amber-300 font-bold text-xs">
              {targetCharacter.minShareLevel} - {targetCharacter.maxShareLevel}
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSend} className="p-6 space-y-4 font-sans">
          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-gamer">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-emerald-300 text-xs font-gamer font-bold">
              {successMsg}
            </div>
          )}

          {/* Sender Character Selection */}
          <div>
            <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
              Seu Personagem Remetente:
            </label>
            {myCharacters.length === 0 ? (
              <p className="text-xs text-amber-400 font-sans">
                Você não possui nenhum personagem cadastrado ainda. Cadastre um para poder convidar.
              </p>
            ) : (
              <select
                value={selectedCharacter?.id || ''}
                onChange={(e) => {
                  playClickSound();
                  const found = myCharacters.find((c) => c.id === e.target.value);
                  if (found) setSelectedCharacter(found);
                }}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-amber-500 font-mono shadow-inner"
              >
                {myCharacters.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.characterName} (Lv.{c.level} {c.vocation} - Kalibra)
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Hunt Target */}
          <div>
            <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
              <Target className="w-3.5 h-3.5 text-rose-400" />
              Local / Objetivo da Hunt <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              required
              list="popular-hunts-list"
              value={huntTarget}
              onChange={(e) => setHuntTarget(e.target.value)}
              placeholder="Ex: Soul War Crater, Library Ice, Issavi"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
            />
            <datalist id="popular-hunts-list">
              {POPULAR_HUNTS.map((h) => (
                <option key={h} value={h} />
              ))}
            </datalist>
          </div>

          {/* Scheduled Time */}
          <div>
            <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Horário Proposto
            </label>
            <input
              type="text"
              required
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
              placeholder="Ex: Hoje às 21:00, Sábado 16h"
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 shadow-inner"
            />
          </div>

          {/* Message / Notes */}
          <div>
            <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              Mensagem ou Canal de Voz (Opcional)
            </label>
            <textarea
              maxLength={200}
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ex: Temos EK e ED, falta você! Vamos Discord da guild."
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none shadow-inner"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playClickSound()}
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-gamer font-semibold transition cursor-pointer"
              >
                <span>Falar no WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
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
                disabled={isSubmitting || myCharacters.length === 0}
                className="gamer-btn-primary flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Enviando...' : 'Enviar Convite'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
