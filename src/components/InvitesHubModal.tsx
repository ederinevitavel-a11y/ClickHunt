import React, { useState } from 'react';
import {
  X,
  Bell,
  Check,
  XCircle,
  Clock,
  Target,
  MessageSquare,
  ExternalLink,
  Send,
  Inbox,
} from 'lucide-react';
import { usePartyData } from '../context/PartyDataContext';
import { buildWhatsAppLink } from '../lib/tibiaMath';
import { playClickSound, playChimeSound } from '../lib/soundEffects';

interface InvitesHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InvitesHubModal: React.FC<InvitesHubModalProps> = ({ isOpen, onClose }) => {
  const { receivedInvites, sentInvites, respondToInvite, cancelInvite, characters, selectedCharacter } = usePartyData();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRespond = async (inviteId: string, status: 'accepted' | 'declined') => {
    setActionLoading(inviteId);
    if (status === 'accepted') playChimeSound();
    else playClickSound();
    try {
      await respondToInvite(inviteId, status);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (inviteId: string) => {
    playClickSound();
    setActionLoading(inviteId);
    try {
      await cancelInvite(inviteId);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div
        className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-cyan-500 shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-gamer font-bold text-base sm:text-xl text-slate-100 uppercase tracking-wide">
                Central de Convites de Party
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-sans">Gerencie propostas para caçadas</p>
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

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 sm:px-6 font-gamer shrink-0">
          <button
            onClick={() => {
              playClickSound();
              setActiveTab('received');
            }}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition cursor-pointer uppercase tracking-wider ${
              activeTab === 'received'
                ? 'border-amber-400 text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Recebidos</span>
            {receivedInvites.filter((i) => i.status === 'pending').length > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-600 text-white rounded-full text-[10px] font-mono font-bold animate-pulse">
                {receivedInvites.filter((i) => i.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              playClickSound();
              setActiveTab('sent');
            }}
            className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-bold border-b-2 transition cursor-pointer uppercase tracking-wider ${
              activeTab === 'sent'
                ? 'border-amber-400 text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Enviados</span>
            <span className="text-xs text-slate-400 font-mono">({sentInvites.length})</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-3 font-sans">
          {activeTab === 'received' ? (
            receivedInvites.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <Inbox className="w-10 h-10 mx-auto text-slate-600" />
                <p className="font-gamer text-sm uppercase font-bold text-slate-300">Nenhum convite recebido</p>
                <p className="text-xs text-slate-500 font-sans">
                  Cadastre seus personagens e ative &quot;Interesse em Propostas&quot; para aparecer no radar de outras PTs!
                </p>
              </div>
            ) : (
              receivedInvites.map((inv) => {
                const senderChar = characters.find((c) => c.characterName === inv.fromCharName);
                const senderWhatsapp = senderChar?.whatsappNumber;
                const whatsappHref = selectedCharacter && senderWhatsapp
                  ? buildWhatsAppLink(
                      senderWhatsapp,
                      selectedCharacter.characterName,
                      selectedCharacter.vocation,
                      selectedCharacter.level,
                      inv.fromCharName,
                      inv.huntTarget
                    )
                  : senderWhatsapp
                  ? `https://wa.me/${senderWhatsapp.replace(/\D/g, '')}`
                  : null;

                return (
                  <div
                    key={inv.id}
                    className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5 transition hover:border-slate-700"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-gamer font-bold text-slate-100 text-sm">{inv.fromCharName}</span>
                          <span className="text-xs text-slate-400">convidou</span>
                          <span className="font-gamer font-bold text-amber-400 text-sm">{inv.toCharName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                          <span className="flex items-center gap-1 text-slate-200">
                            <Target className="w-3.5 h-3.5 text-rose-400" />
                            {inv.huntTarget}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {inv.scheduledTime}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`font-gamer text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                          inv.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : inv.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        }`}
                      >
                        {inv.status === 'pending'
                          ? 'Pendente'
                          : inv.status === 'accepted'
                          ? 'Aceito'
                          : 'Recusado'}
                      </span>
                    </div>

                    {inv.message && (
                      <div className="bg-slate-900/90 p-2.5 rounded-lg text-xs text-slate-300 flex items-start gap-2 border border-slate-800">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                        <span className="italic">{inv.message}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                      {inv.status === 'pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRespond(inv.id, 'accepted')}
                            disabled={actionLoading === inv.id}
                            className="gamer-btn-primary flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aceitar PT</span>
                          </button>
                          <button
                            onClick={() => handleRespond(inv.id, 'declined')}
                            disabled={actionLoading === inv.id}
                            className="gamer-btn-secondary flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs cursor-pointer hover:text-rose-400"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Recusar</span>
                          </button>
                        </div>
                      ) : (
                        <span className="font-gamer text-xs text-slate-500 uppercase">Convite finalizado</span>
                      )}

                      {/* WhatsApp Button */}
                      {whatsappHref && (
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => playClickSound()}
                          className="flex items-center gap-1 px-3 py-1.5 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/50 border border-emerald-600/40 rounded-lg text-xs font-gamer font-semibold transition cursor-pointer"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>WhatsApp do Líder</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )
          ) : (
            sentInvites.length === 0 ? (
              <div className="text-center py-10 text-slate-400 space-y-2">
                <Send className="w-10 h-10 mx-auto text-slate-600" />
                <p className="font-gamer text-sm uppercase font-bold text-slate-300">Nenhum convite enviado</p>
                <p className="text-xs text-slate-500 font-sans">
                  Navegue pelos cards de jogadores no Dashboard e clique em &quot;Convidar p/ PT&quot;!
                </p>
              </div>
            ) : (
              sentInvites.map((inv) => (
                <div
                  key={inv.id}
                  className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2.5 transition"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Enviado por</span>
                        <span className="font-gamer font-bold text-amber-400 text-sm">{inv.fromCharName}</span>
                        <span className="text-xs text-slate-400">para</span>
                        <span className="font-gamer font-bold text-slate-100 text-sm">{inv.toCharName}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 text-slate-200">
                          <Target className="w-3.5 h-3.5 text-rose-400" />
                          {inv.huntTarget}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {inv.scheduledTime}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`font-gamer text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                        inv.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : inv.status === 'accepted'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                      }`}
                    >
                      {inv.status === 'pending'
                        ? 'Aguardando'
                        : inv.status === 'accepted'
                        ? 'Aceito!'
                        : 'Recusado'}
                    </span>
                  </div>

                  {inv.message && (
                    <p className="text-xs text-slate-400 italic bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                      &quot;{inv.message}&quot;
                    </p>
                  )}

                  {inv.status === 'pending' && (
                    <div className="pt-2 border-t border-slate-800 flex justify-end">
                      <button
                        onClick={() => handleCancel(inv.id)}
                        disabled={actionLoading === inv.id}
                        className="font-gamer text-xs text-rose-400 hover:text-rose-300 transition cursor-pointer uppercase"
                      >
                        Cancelar este convite
                      </button>
                    </div>
                  )}
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};
