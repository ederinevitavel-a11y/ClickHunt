import React from 'react';
import {
  Sparkles,
  Shield,
  Clock,
  Swords,
  Users,
  Eye,
  AlertCircle,
  Compass,
  Radio,
} from 'lucide-react';
import { Character } from '../types';
import { usePartyData } from '../context/PartyDataContext';
import { calculateSynergy, VOCATION_META } from '../lib/tibiaMath';
import { CharacterCard } from './CharacterCard';
import { playClickSound } from '../lib/soundEffects';

interface SmartSuggestionsProps {
  onInvite: (character: Character) => void;
  onOpenCharModal: () => void;
  onDelete?: (charId: string) => void;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  onInvite,
  onOpenCharModal,
  onDelete,
}) => {
  const { characters, selectedCharacter, myCharacters } = usePartyData();

  if (!selectedCharacter) {
    return (
      <div className="hud-panel rounded-2xl p-8 sm:p-10 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Compass className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="font-gamer font-bold text-lg text-slate-100 uppercase tracking-wide">
            Selecione ou Cadastre seu Personagem
          </h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            O algoritmo de sugestão automática analisa a faixa de exp share (mínimo e máximo), servidor, horários disponíveis e sinergia de vocações da sua PT.
          </p>
        </div>
        <button
          onClick={() => {
            playClickSound();
            onOpenCharModal();
          }}
          className="gamer-btn-primary px-5 py-2.5 rounded-xl text-xs cursor-pointer"
        >
          {myCharacters.length === 0 ? 'Cadastrar Meu Personagem' : 'Selecionar Personagem'}
        </button>
      </div>
    );
  }

  // Filter other characters (exclude current user's active character)
  const candidatePool = characters.filter((c) => c.id !== selectedCharacter.id);

  // Calculate synergy scores for all candidates
  const scoredCandidates = candidatePool.map((char) => ({
    character: char,
    match: calculateSynergy(selectedCharacter, char),
  }));

  // Strict match: Kalibra server + Share eligible + has at least one period overlap
  const strictMatches = scoredCandidates.filter(
    (item) => item.match.isShareEligible && item.match.periodOverlap.length > 0
  );

  // Sort by synergy score descending
  strictMatches.sort((a, b) => b.match.score - a.match.score);

  const hasStrictMatches = strictMatches.length > 0;
  const displayList = hasStrictMatches
    ? strictMatches
    : scoredCandidates
        .sort((a, b) => b.match.score - a.match.score)
        .slice(0, 8);

  const activeMeta = VOCATION_META[selectedCharacter.vocation];

  return (
    <div className="space-y-6">
      {/* Active Character Matchmaker Header Bar */}
      <div className="hud-panel rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
        <div className="flex items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center font-gamer font-bold text-base border shrink-0 shadow-lg"
            style={{
              borderColor: `${activeMeta?.hexColor || '#f59e0b'}60`,
              backgroundColor: `${activeMeta?.hexColor || '#f59e0b'}15`,
              color: activeMeta?.textColor.replace('text-', ''),
            }}
          >
            {activeMeta?.badge}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-gamer font-bold text-xs uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" /> Radar de Match Ativo
              </span>
              <span className="font-mono text-[11px] font-bold bg-slate-900 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40 uppercase">
                Kalibra
              </span>
            </div>
            <h2 className="font-gamer font-bold text-xl text-slate-100 tracking-wide mt-0.5">
              {selectedCharacter.characterName}{' '}
              <span className="text-amber-400 font-mono font-bold text-lg">Lv.{selectedCharacter.level}</span>
            </h2>
            <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5 font-sans">
              <span>
                Faixa Share:{' '}
                <strong className="text-amber-300 font-mono">
                  Lv.{selectedCharacter.minShareLevel} - Lv.{selectedCharacter.maxShareLevel}
                </strong>
              </span>
              <span>•</span>
              <span>{(selectedCharacter.availablePeriods || []).join(', ') || 'Qualquer horário'}</span>
            </div>
          </div>
        </div>

        {/* Visibility Badge (Fallback Requirement from User Prompt) */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800/90 px-4 py-2.5 rounded-xl text-xs text-slate-300 shadow-inner">
          <div className="relative">
            <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="font-gamer font-bold text-emerald-400 uppercase tracking-wide">
              Card Ativo no Radar Público
            </div>
            <div className="text-[11px] text-slate-400 font-sans">Visível para todos os jogadores de Kalibra</div>
          </div>
        </div>
      </div>

      {/* Suggestion Content */}
      {hasStrictMatches ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-gamer font-bold text-sm text-slate-200 flex items-center gap-2 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Jogadores Compatíveis ({strictMatches.length})
            </h3>
            <span className="text-xs text-slate-400 font-sans">
              Mesmo servidor • Faixa de Share • Horários compatíveis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {strictMatches.map(({ character, match }) => (
              <CharacterCard
                key={character.id}
                character={character}
                matchScore={match}
                onInvite={onInvite}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Fallback Container */
        <div className="space-y-5">
          <div className="hud-panel rounded-2xl p-5 border border-amber-500/30 flex items-start gap-3.5">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-gamer font-bold text-sm text-amber-300 uppercase tracking-wide">
                Nenhum jogador com 100% de horários idênticos no momento
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Não se preocupe: seu card do personagem <strong>{selectedCharacter.characterName}</strong> está{' '}
                <strong className="text-emerald-400 font-semibold">visível para todos os jogadores</strong> no Dashboard. Assim que outro player do seu servidor entrar ou pesquisar, você aparecerá na lista dele.
              </p>
              <p className="text-xs text-slate-400 pt-1 font-sans">
                Abaixo estão todos os jogadores disponíveis para você convidar ou combinar caçadas pelo WhatsApp:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayList.map(({ character, match }) => (
              <CharacterCard
                key={character.id}
                character={character}
                matchScore={match}
                onInvite={onInvite}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
