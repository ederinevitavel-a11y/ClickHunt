import React from 'react';
import {
  Shield,
  Clock,
  Calendar,
  Sparkles,
  Swords,
  MessageSquare,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Target,
  Zap,
} from 'lucide-react';
import { Character, MatchScore } from '../types';
import { useAuth } from '../context/AuthContext';
import { usePartyData } from '../context/PartyDataContext';
import { VOCATION_META, buildWhatsAppLink, isLevelInShareRange } from '../lib/tibiaMath';
import { playClickSound, playTransmissionSound } from '../lib/soundEffects';

interface CharacterCardProps {
  character: Character;
  matchScore?: MatchScore;
  onInvite: (character: Character) => void;
  onEdit?: (character: Character) => void;
  onDelete?: (charId: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  matchScore,
  onInvite,
  onEdit,
  onDelete,
}) => {
  const { user } = useAuth();
  const { selectedCharacter } = usePartyData();
  const [isConfirmingDelete, setIsConfirmingDelete] = React.useState(false);

  const isOwner = user?.uid === character.ownerId;
  const isAdmin = user?.email === 'ederinevitavel@gmail.com';
  const meta = VOCATION_META[character.vocation] || VOCATION_META.Knight;

  // Real-time share check against current selected char
  const isInShareWithMe = selectedCharacter
    ? isLevelInShareRange(selectedCharacter.level, character.level)
    : false;

  const isSameWorld = true;

  const whatsappHref = selectedCharacter && character.whatsappNumber
    ? buildWhatsAppLink(
        character.whatsappNumber,
        selectedCharacter.characterName,
        selectedCharacter.vocation,
        selectedCharacter.level,
        character.characterName,
        character.huntsInterest?.[0]
      )
    : character.whatsappNumber
    ? `https://wa.me/${character.whatsappNumber.replace(/\D/g, '')}`
    : '#';

  const handleInviteClick = () => {
    playTransmissionSound();
    onInvite(character);
  };

  const handleEditClick = () => {
    playClickSound();
    onEdit?.(character);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl transition-all duration-300 hud-panel flex flex-col justify-between ${
        isInShareWithMe
          ? 'border-slate-700/80 hover:border-amber-500/70 hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.25)]'
          : 'border-slate-800/80 hover:border-slate-700 hover:shadow-lg'
      }`}
    >
      {/* Top Neon Ambient Bar */}
      <div className={`h-[3px] w-full bg-gradient-to-r ${meta.gradient}`} style={{ backgroundColor: meta.hexColor }} />

      <div className="p-5 flex flex-col justify-between h-full space-y-4">
        {/* Header: Name, Vocation, Level & World */}
        <div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-gamer font-bold text-lg text-slate-100 truncate group-hover:text-amber-300 transition tracking-wide">
                  {character.characterName}
                </h3>
                <span className="font-mono text-[11px] font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/40 uppercase">
                  Kalibra
                </span>
                {!character.approved && (
                  <span className="text-[10px] font-gamer font-bold text-amber-500 bg-amber-950/40 border border-amber-500/40 px-2 py-0.5 rounded animate-pulse" title="Este personagem está aguardando aprovação do administrador.">
                    Pendente
                  </span>
                )}
              </div>

              {/* Vocation and Role Tag */}
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="font-gamer font-bold text-xs uppercase px-2 py-0.5 rounded border"
                  style={{
                    color: meta.textColor.replace('text-', ''),
                    borderColor: `${meta.hexColor}60`,
                    backgroundColor: `${meta.hexColor}15`,
                  }}
                >
                  {meta.badge} • {character.vocation}
                </span>
                <span className="text-[11px] text-slate-400 truncate hidden xs:inline font-sans">
                  {meta.role}
                </span>
              </div>
            </div>

            {/* Tactical Level Meter Badge */}
            <div className="text-right shrink-0">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-gamer font-bold uppercase tracking-wider text-slate-400">
                  Nível
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.4)]">
                  {character.level}
                </span>
              </div>
            </div>
          </div>

          {/* Faixa de Exp Share (Gaming HUD Gauge) */}
          <div className="mt-3.5 bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between text-xs font-gamer">
              <span className="text-slate-400 font-semibold flex items-center gap-1.5 uppercase tracking-wide">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Faixa XP Share:
              </span>
              <span className="font-mono font-bold text-slate-200">
                <span className="text-amber-300">Lv.{character.minShareLevel}</span>
                <span className="text-slate-500 mx-1.5 font-normal">/</span>
                <span className="text-amber-300">Lv.{character.maxShareLevel}</span>
              </span>
            </div>

            {/* Tactical Visual Segment Meter */}
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex">
              <div className="bg-slate-700 w-1/4 h-full" />
              <div className="bg-gradient-to-r from-amber-500 to-yellow-400 w-1/2 h-full shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <div className="bg-slate-700 w-1/4 h-full" />
            </div>
          </div>

          {/* Sinergia / Comparação com o char ativo */}
          {selectedCharacter && !isOwner && (
            <div className="mt-2.5">
              {isInShareWithMe ? (
                <div className="flex items-center gap-2 text-xs font-gamer font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/40 px-3 py-1.5 rounded-xl shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Share 100% Compatível com seu {selectedCharacter.characterName}!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-gamer font-medium text-slate-400 bg-slate-900/60 border border-slate-800 px-3 py-1.5 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>Fora do Share ({selectedCharacter.minShareLevel} - {selectedCharacter.maxShareLevel})</span>
                </div>
              )}
            </div>
          )}

          {/* Match Score Badge (if available from algorithm) */}
          {matchScore && (
            <div className="mt-2 flex items-center justify-between bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs">
              <span className="font-gamer font-bold text-amber-300 uppercase tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Sinergia de PT:
              </span>
              <span className="font-mono font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40 text-[11px]">
                {matchScore.score}% MATCH
              </span>
            </div>
          )}
        </div>

        {/* Content Section: Horários, Hunts, Bestiary */}
        <div className="space-y-3 text-xs text-slate-300">
          {/* Horários e Dias Disponíveis */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 font-gamer font-semibold text-[11px] uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Horários de Caçada:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(character.availablePeriods || []).length > 0 ? (
                character.availablePeriods.map((period) => {
                  const isManual = !['Manhã (06h - 12h)', 'Tarde (12h - 18h)', 'Noite (18h - 00h)', 'Madrugada (00h - 06h)'].includes(period);
                  return (
                    <span
                      key={period}
                      className={`px-2.5 py-0.5 rounded-lg text-[11px] border font-sans ${
                        isManual
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 font-mono font-semibold'
                          : 'bg-slate-950/70 text-slate-300 border-slate-800'
                      }`}
                    >
                      {isManual ? `⏰ ${period}` : period}
                    </span>
                  );
                })
              ) : (
                <span className="text-slate-500 italic text-[11px]">Não especificado</span>
              )}
            </div>

            {/* Dias da semana */}
            {(character.availableDays || []).length > 0 && (
              <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-400">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="truncate">{character.availableDays.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Hunts de Interesse (Super Destacado & Gamer HUD Style) */}
          <div className="bg-slate-950/90 border border-rose-500/30 rounded-xl p-3.5 space-y-2.5 shadow-md shadow-rose-950/10">
            <div className="flex items-center gap-2 text-rose-400 font-gamer font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
              <span>Hunts de Interesse:</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {(character.huntsInterest || []).length > 0 ? (
                (character.huntsInterest || []).map((rawHunt, index) => {
                  const hunt = typeof rawHunt === 'string'
                    ? { name: rawHunt, bestiaryDone: false }
                    : { name: rawHunt.name, bestiaryDone: !!rawHunt.bestiaryDone };
                  
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 px-2.5 py-1.5 bg-rose-500/10 text-rose-200 rounded-lg text-xs font-semibold border border-rose-500/20 hover:border-rose-400/40 transition shadow-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 animate-pulse" />
                        <span className="font-sans font-bold tracking-wide truncate" title={hunt.name}>
                          {hunt.name}
                        </span>
                      </div>
                      
                      {/* Bestiary Status Indicator Symbol */}
                      {hunt.bestiaryDone ? (
                        <span
                          className="flex items-center gap-1 text-[9px] font-gamer font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider"
                          title="Bestiário Concluído"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Feito</span>
                        </span>
                      ) : (
                        <span
                          className="flex items-center gap-1 text-[9px] font-gamer font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-wider"
                          title="Precisa de Bestiário"
                        >
                          <AlertCircle className="w-3 h-3 text-amber-400" />
                          <span>Falta</span>
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/40 text-slate-400 rounded-lg text-xs italic border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600 shrink-0" />
                  <span>Aberto a propostas / Qualquer hunt</span>
                </div>
              )}
            </div>
          </div>

          {/* Bestiary & Charm Status (Checkbox state badge + Observações) */}
          {(() => {
            const rawBestiary = character.bestiaryStatus || '';
            const isDone = rawBestiary.toLowerCase().includes('já tem') || rawBestiary.toLowerCase().includes('feito') || rawBestiary.toLowerCase().includes('pronto');
            let observations = '';
            if (rawBestiary.includes('•')) {
              observations = rawBestiary.split('•').slice(1).join('•').trim();
            } else if (rawBestiary.includes('|')) {
              observations = rawBestiary.split('|').slice(1).join('|').trim();
            } else if (!rawBestiary.toLowerCase().startsWith('precisa') && !rawBestiary.toLowerCase().startsWith('já tem')) {
              observations = rawBestiary;
            }

            return (
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-gamer font-bold text-slate-400 text-[11px] uppercase tracking-wide flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    Bestiary / Charms:
                  </span>
                  {!isDone ? (
                    <span className="font-gamer text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider shrink-0">
                      Precisa de Bestiary
                    </span>
                  ) : (
                    <span className="font-gamer text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider shrink-0">
                      Bestiary Feito
                    </span>
                  )}
                </div>

                {observations ? (
                  <p className="text-slate-200 text-xs font-sans leading-relaxed">
                    <span className="text-slate-400 font-gamer text-[10px] uppercase font-bold">Obs: </span>
                    {observations}
                  </p>
                ) : (
                  <p className="text-slate-400 text-[11px] font-sans">
                    {!isDone
                      ? 'Foco em completar monstros e pontuar charms.'
                      : 'Bestiários concluídos, charms já liberados.'}
                  </p>
                )}
              </div>
            );
          })()}

          {/* Proposals Open status */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60 font-gamer">
            <span className="text-slate-400 uppercase text-[11px]">Status de Propostas:</span>
            {character.interestedInProposals ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
                ABERTO A PTs
              </span>
            ) : (
              <span className="text-slate-500 uppercase">PT Fixa</span>
            )}
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2.5">
          {/* Owner actions (Edit / Delete) */}
          {isOwner ? (
            <div className="flex flex-col gap-2 w-full">
              {isConfirmingDelete ? (
                <div className="flex items-center gap-2 w-full animate-fade-in bg-slate-900/60 border border-slate-800 p-1.5 rounded-xl">
                  <span className="text-[10px] text-rose-400 font-gamer font-bold uppercase truncate flex-1 pl-1">
                    Excluir {character.characterName}?
                  </span>
                  <button
                    onClick={async () => {
                      playClickSound();
                      try {
                        if (onDelete) {
                          await onDelete(character.id);
                        }
                        setIsConfirmingDelete(false);
                      } catch (err: any) {
                        console.error('Erro ao deletar personagem:', err);
                        alert(`Erro ao deletar: ${err.message || err}`);
                      }
                    }}
                    className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-slate-100 rounded-lg text-[10px] font-gamer font-bold uppercase cursor-pointer"
                  >
                    Sim
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      setIsConfirmingDelete(false);
                    }}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-gamer font-bold uppercase cursor-pointer"
                  >
                    Não
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 w-full">
                  <button
                    onClick={handleEditClick}
                    className="gamer-btn-secondary flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                    <span>Editar Char</span>
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      setIsConfirmingDelete(true);
                    }}
                    className="p-2 bg-slate-900/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 rounded-xl transition cursor-pointer"
                    title="Excluir personagem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 w-full">
              {/* Convidar para PT Button */}
              <button
                onClick={handleInviteClick}
                className="gamer-btn-primary flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs cursor-pointer"
              >
                <Swords className="w-4 h-4" />
                <span>Convidar p/ PT</span>
              </button>

              {/* WhatsApp direct button if available */}
              {character.whatsappNumber && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playClickSound()}
                  className="flex items-center justify-center p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-950/40 transition transform active:scale-95 cursor-pointer"
                  title={`Conversar no WhatsApp (${character.whatsappNumber})`}
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              )}

              {/* Quick Admin Delete Button */}
              {isAdmin && (
                <button
                  onClick={async () => {
                    playClickSound();
                    if (confirm(`ADMIN: Deseja realmente excluir permanentemente o personagem "${character.characterName}" do banco de dados?`)) {
                      try {
                        if (onDelete) {
                          await onDelete(character.id);
                        }
                      } catch (err: any) {
                        console.error(err);
                        alert(`Erro ao excluir: ${err.message || err}`);
                      }
                    }
                  }}
                  className="p-2.5 bg-rose-950/50 hover:bg-rose-600 border border-rose-500/30 text-rose-400 hover:text-white rounded-xl transition cursor-pointer shrink-0"
                  title="ADMIN: Excluir Personagem da Base"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
