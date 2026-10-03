import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Shield,
  X,
  PlusCircle,
  Users,
} from 'lucide-react';
import { Character, Vocation } from '../types';
import { usePartyData } from '../context/PartyDataContext';
import { useAuth } from '../context/AuthContext';
import { CharacterCard } from './CharacterCard';
import { VOCATION_META, isLevelInShareRange } from '../lib/tibiaMath';
import { playClickSound } from '../lib/soundEffects';

interface RosterViewProps {
  onInvite: (character: Character) => void;
  onEdit: (character: Character) => void;
  onDelete: (charId: string) => void;
  onOpenCharModal: () => void;
}

const VOCATIONS_LIST: (Vocation | 'All')[] = ['All', 'Knight', 'Paladin', 'Sorcerer', 'Druid', 'Monk'];

export const RosterView: React.FC<RosterViewProps> = ({
  onInvite,
  onEdit,
  onDelete,
  onOpenCharModal,
}) => {
  const { characters, selectedCharacter } = usePartyData();
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVocation, setSelectedVocation] = useState<Vocation | 'All'>('All');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All');
  const [selectedBestiary, setSelectedBestiary] = useState<'All' | 'needs' | 'done'>('All');
  const [onlyShareCompatible, setOnlyShareCompatible] = useState(false);
  const [sortBy, setSortBy] = useState<'level_desc' | 'level_asc' | 'recent'>('level_desc');

  // Filtered & Sorted Characters
  const filteredCharacters = useMemo(() => {
    return characters.filter((char) => {
      // 0. Only show approved characters OR if it belongs to the current user (so they see their pending approval char!)
      const isOwner = user?.uid === char.ownerId;
      if (!char.approved && !isOwner) {
        return false;
      }

      // 1. Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = char.characterName.toLowerCase().includes(term);
        const matchesHunt = (char.huntsInterest || []).some((h) => h.toLowerCase().includes(term));
        const matchesNotes = (char.bestiaryStatus || '').toLowerCase().includes(term);
        const matchesPeriod = (char.availablePeriods || []).some((p) => p.toLowerCase().includes(term));
        if (!matchesName && !matchesHunt && !matchesNotes && !matchesPeriod) return false;
      }

      // 2. Vocation filter
      if (selectedVocation !== 'All' && char.vocation !== selectedVocation) {
        return false;
      }

      // 3. Period filter
      if (selectedPeriod !== 'All') {
        if (selectedPeriod === 'Manual') {
          const standardList = ['Manhã (06h - 12h)', 'Tarde (12h - 18h)', 'Noite (18h - 00h)', 'Madrugada (00h - 06h)'];
          const hasManual = (char.availablePeriods || []).some((p) => !standardList.includes(p));
          if (!hasManual) return false;
        } else {
          const hasPeriod = (char.availablePeriods || []).some((p) =>
            p.toLowerCase().includes(selectedPeriod.toLowerCase())
          );
          if (!hasPeriod) return false;
        }
      }

      // 4. Bestiary Status filter
      if (selectedBestiary !== 'All') {
        const raw = (char.bestiaryStatus || '').toLowerCase();
        const isDone = raw.includes('já tem') || raw.includes('feito') || raw.includes('pronto');
        if (selectedBestiary === 'needs' && isDone) return false;
        if (selectedBestiary === 'done' && !isDone) return false;
      }

      // 5. Share compatibility toggle (if active char exists)
      if (onlyShareCompatible && selectedCharacter) {
        if (!isLevelInShareRange(selectedCharacter.level, char.level)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'level_desc') return b.level - a.level;
      if (sortBy === 'level_asc') return a.level - b.level;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [
    characters,
    searchTerm,
    selectedVocation,
    selectedPeriod,
    selectedBestiary,
    onlyShareCompatible,
    selectedCharacter,
    sortBy,
  ]);

  const clearFilters = () => {
    playClickSound();
    setSearchTerm('');
    setSelectedVocation('All');
    setSelectedPeriod('All');
    setSelectedBestiary('All');
    setOnlyShareCompatible(false);
  };

  const hasActiveFilters =
    searchTerm ||
    selectedVocation !== 'All' ||
    selectedPeriod !== 'All' ||
    selectedBestiary !== 'All' ||
    onlyShareCompatible;

  return (
    <div className="space-y-6">
      {/* Search and Filters Bar */}
      <div className="hud-panel rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, hunt ou mundo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition font-sans shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Stats & Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
            <span className="text-xs text-slate-400 font-gamer">
              Exibindo <strong className="text-amber-400 font-mono">{filteredCharacters.length}</strong> de {characters.length} Chars
            </span>

            <select
              value={sortBy}
              onChange={(e) => {
                playClickSound();
                setSortBy(e.target.value as 'level_desc' | 'level_asc' | 'recent');
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-gamer font-semibold text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer uppercase"
            >
              <option value="level_desc">Maior Level</option>
              <option value="level_asc">Menor Level</option>
              <option value="recent">Mais Recentes</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
          {/* Vocation Pills */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-gamer font-bold text-xs text-slate-400 uppercase tracking-wide mr-1">
              Vocação:
            </span>
            {VOCATIONS_LIST.map((voc) => {
              const isSelected = selectedVocation === voc;
              const meta = voc !== 'All' ? VOCATION_META[voc] : null;
              return (
                <button
                  key={voc}
                  onClick={() => {
                    playClickSound();
                    setSelectedVocation(voc);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-gamer font-bold uppercase tracking-wider border transition cursor-pointer ${
                    isSelected
                      ? meta
                        ? `${meta.accentColor} ring-2 ring-amber-400/40 shadow-md`
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/50 ring-2 ring-amber-400/40'
                      : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {voc === 'All' ? 'Todas' : meta?.badge || voc}
                </button>
              );
            })}
          </div>

          {/* Server & Period select dropdowns */}
          <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-start lg:justify-end">
            {/* Fixed Server Badge */}
            <div className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-3 py-1.5 bg-slate-950 border border-slate-700/80 rounded-xl text-xs font-gamer font-bold text-slate-300 uppercase shadow-inner">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Mundo: <span className="text-cyan-400">Kalibra</span></span>
            </div>

            {/* Period */}
            <select
              value={selectedPeriod}
              onChange={(e) => {
                playClickSound();
                setSelectedPeriod(e.target.value);
              }}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-gamer text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer uppercase"
            >
              <option value="All">Horário: Todos</option>
              <option value="Manhã">Manhã (06h - 12h)</option>
              <option value="Tarde">Tarde (12h - 18h)</option>
              <option value="Noite">Noite (18h - 00h)</option>
              <option value="Madrugada">Madrugada (00h - 06h)</option>
              <option value="Manual">⏰ Horários Manuais (Ex: 20h - 23h)</option>
            </select>

            {/* Bestiary Status Filter */}
            <select
              value={selectedBestiary}
              onChange={(e) => {
                playClickSound();
                setSelectedBestiary(e.target.value as 'All' | 'needs' | 'done');
              }}
              className="w-full sm:w-auto px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs font-gamer text-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer uppercase"
            >
              <option value="All">Bestiary: Todos</option>
              <option value="needs">⚡ Precisa de Bestiary</option>
              <option value="done">✓ Bestiary Já Feito</option>
            </select>

            {/* Only Share Toggle */}
            {selectedCharacter && (
              <button
                onClick={() => {
                  playClickSound();
                  setOnlyShareCompatible(!onlyShareCompatible);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-gamer font-bold uppercase tracking-wider border transition cursor-pointer ${
                  onlyShareCompatible
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
                title={`Mostrar apenas chars entre Lv. ${selectedCharacter.minShareLevel} e ${selectedCharacter.maxShareLevel}`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                <span>No meu Share</span>
              </button>
            )}

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="font-gamer text-xs text-amber-400 hover:text-amber-300 px-2 py-1 underline cursor-pointer uppercase tracking-wider"
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid of Character Cards */}
      {filteredCharacters.length === 0 ? (
        <div className="hud-panel rounded-2xl p-12 text-center space-y-4">
          <Users className="w-12 h-12 mx-auto text-slate-600" />
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="font-gamer font-bold text-base text-slate-200 uppercase">Nenhum personagem encontrado</h3>
            <p className="text-xs text-slate-400 font-sans">
              Tente relaxar os filtros de busca ou cadastre um char nessa faixa!
            </p>
          </div>
          <button
            onClick={() => {
              playClickSound();
              onOpenCharModal();
            }}
            className="gamer-btn-primary flex items-center gap-1.5 mx-auto px-5 py-2.5 rounded-xl text-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Meu Personagem</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCharacters.map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              onInvite={onInvite}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
