import React from 'react';
import {
  Users,
  Clock,
  Target,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  LogOut,
  Trash2,
  UserPlus,
  Crown,
  Sparkles,
} from 'lucide-react';
import { Party, PartyMember } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePartyData } from '../context/PartyDataContext';
import { buildWhatsAppLink, VOCATION_META, isLevelInShareRange } from '../lib/tibiaMath';
import { playClickSound, playChimeSound } from '../lib/soundEffects';
import confetti from 'canvas-confetti';

interface PartyCardProps {
  party: Party;
}

export const PartyCard: React.FC<PartyCardProps> = ({ party }) => {
  const { user } = useAuth();
  const { selectedCharacter, joinParty, leaveParty, disbandParty } = usePartyData();
  const [isConfirmingDisband, setIsConfirmingDisband] = React.useState(false);

  const isLeader = user?.uid === party.leaderId;
  const isMember = party.members.some((m) => m.userId === user?.uid);
  const isFull = party.members.length >= party.targetSize;

  // Check if current user's selected char can join
  const canJoin =
    user &&
    selectedCharacter &&
    !isMember &&
    !isFull &&
    party.members.every((m) => isLevelInShareRange(m.level, selectedCharacter.level));

  const handleJoin = async () => {
    if (!selectedCharacter || !user) return;
    playChimeSound();
    try {
      const newMember: PartyMember = {
        userId: user.uid,
        characterName: selectedCharacter.characterName,
        vocation: selectedCharacter.vocation,
        level: selectedCharacter.level,
        isLeader: false,
        whatsappNumber: selectedCharacter.whatsappNumber,
      };
      await joinParty(party.id, newMember);

      if (party.members.length + 1 >= party.targetSize) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const leaderMember = party.members.find((m) => m.isLeader);
  const leaderWhatsapp = leaderMember?.whatsappNumber;
  const whatsappHref = selectedCharacter && leaderWhatsapp
    ? buildWhatsAppLink(
        leaderWhatsapp,
        selectedCharacter.characterName,
        selectedCharacter.vocation,
        selectedCharacter.level,
        party.leaderCharName,
        party.huntTarget
      )
    : leaderWhatsapp
    ? `https://wa.me/${leaderWhatsapp.replace(/\D/g, '')}`
    : null;

  return (
    <div className="hud-panel rounded-2xl p-5 space-y-4 transition border border-slate-800/90 hover:border-slate-700">
      {/* Top Accent Strip */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-gamer font-bold text-lg text-slate-100 flex items-center gap-2 tracking-wide">
              <Target className="w-4 h-4 text-rose-400" />
              {party.huntTarget}
            </h3>
            <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-cyan-950/40 text-cyan-300 border border-cyan-500/40 uppercase">
              Kalibra
            </span>
            <span className="font-gamer text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              {party.targetSize} Integrantes ({party.targetSize === 4 ? '+100% EXP' : 'EXPANDIDA'})
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-sans">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              {party.scheduledTime}
            </span>
            <span className="flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              Líder: <strong className="text-slate-200 font-gamer">{party.leaderCharName}</strong>
            </span>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="text-right shrink-0">
          <span
            className={`font-gamer text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              isFull
                ? 'bg-purple-950/40 text-purple-300 border-purple-500/40'
                : 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
            }`}
          >
            {isFull ? 'PT LOTADA' : `VAGAS: ${party.targetSize - party.members.length}`}
          </span>
          <div className="text-xs text-slate-400 font-mono mt-1 font-bold">
            {party.members.length}/{party.targetSize} SLOTS
          </div>
        </div>
      </div>

      {/* Modern MMORPG Member Slots Visualizer */}
      <div className="space-y-1.5">
        <span className="font-gamer text-[11px] uppercase tracking-widest text-slate-400 font-bold block">
          Formação da Party:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {Array.from({ length: party.targetSize }).map((_, index) => {
            const member = party.members[index];
            if (member) {
              const meta = VOCATION_META[member.vocation];
              return (
                <div
                  key={member.userId + index}
                  className="bg-slate-950/90 border rounded-xl p-2.5 flex flex-col justify-between transition"
                  style={{ borderColor: `${meta?.hexColor || '#334155'}50` }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="font-gamer font-bold text-[10px] px-1.5 py-0.2 rounded border uppercase"
                      style={{
                        color: meta?.textColor.replace('text-', ''),
                        borderColor: `${meta?.hexColor}50`,
                        backgroundColor: `${meta?.hexColor}15`,
                      }}
                    >
                      {meta?.badge}
                    </span>
                    {member.isLeader && (
                      <span title="Líder da Party">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                      </span>
                    )}
                  </div>

                  <div className="my-1.5 truncate">
                    <span className="font-gamer font-bold text-slate-100 text-xs truncate block">
                      {member.characterName}
                    </span>
                    <span className="text-amber-400 font-mono font-bold text-[11px]">
                      Lv. {member.level}
                    </span>
                  </div>

                  {/* Micro Health/Mana Gauge Aesthetic */}
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: meta?.hexColor || '#f59e0b',
                        width: '100%',
                      }}
                    />
                  </div>
                </div>
              );
            }

            return (
              <div
                key={`empty-${index}`}
                className="bg-slate-950/40 border border-dashed border-slate-800 rounded-xl p-2.5 flex flex-col items-center justify-center text-slate-500 text-center min-h-[80px]"
              >
                <Users className="w-4 h-4 opacity-40 mb-1" />
                <span className="font-gamer text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Slot Livre
                </span>
                <span className="text-[9px] text-slate-600 font-sans">Aguardando</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Share Exp Status Bar */}
      <div
        className={`p-2.5 rounded-xl border text-xs flex items-center justify-between font-gamer ${
          party.isShareActive
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
        }`}
      >
        <div className="flex items-center gap-1.5 font-bold uppercase tracking-wide">
          {party.isShareActive ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>
            {party.isShareActive
              ? `Share Ativo (${party.minPartyLevel} - ${party.maxPartyLevel})`
              : 'Share Inativo! Desbalanceado'}
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-slate-400">
          Faixa: Lv.{party.minPartyLevel} - Lv.{party.maxPartyLevel}
        </span>
      </div>

      {/* Notes if available */}
      {party.notes && (
        <p className="text-xs text-slate-400 italic bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 font-sans">
          &quot;{party.notes}&quot;
        </p>
      )}

      {/* Footer / Actions */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playClickSound()}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-gamer font-semibold transition cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Falar com Líder</span>
          </a>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-2">
          {isLeader ? (
            isConfirmingDisband ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 rounded-xl animate-fade-in">
                <span className="text-[10px] text-rose-400 font-gamer font-bold uppercase px-1">
                  Desfazer PT?
                </span>
                <button
                  onClick={async () => {
                    playClickSound();
                    try {
                      await disbandParty(party.id);
                      setIsConfirmingDisband(false);
                    } catch (err: any) {
                      console.error('Erro ao desfazer PT:', err);
                      alert(`Erro ao desfazer PT: ${err.message || err}`);
                    }
                  }}
                  className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-slate-100 rounded-lg text-[10px] font-gamer font-bold uppercase cursor-pointer"
                >
                  Sim
                </button>
                <button
                  onClick={() => {
                    playClickSound();
                    setIsConfirmingDisband(false);
                  }}
                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-gamer font-bold uppercase cursor-pointer"
                >
                  Não
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  playClickSound();
                  setIsConfirmingDisband(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-800 rounded-xl text-xs font-gamer font-semibold transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Desfazer PT</span>
              </button>
            )
          ) : isMember ? (
            <button
              onClick={() => {
                playClickSound();
                leaveParty(party.id);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-slate-800 rounded-xl text-xs font-gamer font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da PT</span>
            </button>
          ) : canJoin ? (
            <button
              onClick={handleJoin}
              className="gamer-btn-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Entrar na PT ({selectedCharacter?.characterName})</span>
            </button>
          ) : isFull ? (
            <span className="font-gamer text-xs text-slate-500 uppercase">PT Completa</span>
          ) : !selectedCharacter ? (
            <span className="font-gamer text-xs text-slate-500">Selecione seu char</span>
          ) : (
            <span className="font-gamer text-xs text-slate-500">Fora do Share</span>
          )}
        </div>
      </div>
    </div>
  );
};
