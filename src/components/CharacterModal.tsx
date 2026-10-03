import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Calculator,
  Target,
  Clock,
  Calendar,
  MessageCircle,
  Check,
  AlertCircle,
  Plus,
  Zap,
  CheckSquare,
  Square,
  FileText,
} from 'lucide-react';
import { Character, Vocation, CharacterHunt } from '../types';
import { calculateShareRange, POPULAR_HUNTS, POPULAR_WORLDS, VOCATION_META } from '../lib/tibiaMath';
import { playClickSound, playChimeSound } from '../lib/soundEffects';
import { useTheme } from '../context/ThemeContext';

interface CharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Character, 'id' | 'ownerId' | 'ownerEmail' | 'minShareLevel' | 'maxShareLevel' | 'createdAt' | 'updatedAt' | 'approved'>) => Promise<void>;
  initialData?: Character | null;
}

const VOCATIONS: Vocation[] = ['Knight', 'Paladin', 'Sorcerer', 'Druid', 'Monk'];
const PRESET_PERIODS = ['Manhã (06h - 12h)', 'Tarde (12h - 18h)', 'Noite (18h - 00h)', 'Madrugada (00h - 06h)'];
const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export const CharacterModal: React.FC<CharacterModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
}) => {
  const { themeConfig } = useTheme();
  const [characterName, setCharacterName] = useState('');
  const [level, setLevel] = useState<number>(350);
  const [vocation, setVocation] = useState<Vocation>('Knight');
  const [world] = useState('Kalibra');
  const [availablePeriods, setAvailablePeriods] = useState<string[]>(['Noite (18h - 00h)']);
  const [customPeriodInput, setCustomPeriodInput] = useState('');
  const [availableDays, setAvailableDays] = useState<string[]>(['Segunda', 'Quarta', 'Sexta', 'Sábado']);
  const [huntsInterest, setHuntsInterest] = useState<CharacterHunt[]>([
    { name: 'Library - Fire Section', bestiaryDone: false },
    { name: 'Buried Cathedral -3', bestiaryDone: true },
  ]);
  const [customHunt, setCustomHunt] = useState('');
  
  // Bestiary & Charm Points states
  const [hasBestiary, setHasBestiary] = useState(false);
  const [bestiaryNotes, setBestiaryNotes] = useState('Foco em Charms e Bestiário nas hunts');

  const [interestedInProposals, setInterestedInProposals] = useState(true);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-calculated Share Range
  const { minShareLevel, maxShareLevel } = calculateShareRange(level);

  useEffect(() => {
    if (initialData) {
      setCharacterName(initialData.characterName);
      setLevel(initialData.level);
      setVocation(initialData.vocation);
      setAvailablePeriods(initialData.availablePeriods || []);
      setAvailableDays(initialData.availableDays || []);
      const rawHunts = initialData.huntsInterest || [];
      const normalizedHunts = rawHunts.map((h) => {
        if (typeof h === 'string') {
          return { name: h, bestiaryDone: false };
        }
        return { name: h.name, bestiaryDone: !!h.bestiaryDone };
      });
      setHuntsInterest(normalizedHunts);
      
      // Parse Bestiary Status (Checkbox + Observações)
      const rawStatus = initialData.bestiaryStatus || '';
      if (rawStatus.toLowerCase().includes('já tem') || rawStatus.toLowerCase().includes('feito') || rawStatus.toLowerCase().includes('pronto')) {
        setHasBestiary(true);
      } else {
        setHasBestiary(false);
      }
      
      // Extract observations after "•" or "|" or entire text
      if (rawStatus.includes('•')) {
        setBestiaryNotes(rawStatus.split('•')[1].trim());
      } else if (rawStatus.includes('|')) {
        setBestiaryNotes(rawStatus.split('|')[1].trim());
      } else {
        setBestiaryNotes(rawStatus);
      }

      setInterestedInProposals(initialData.interestedInProposals);
      setWhatsappNumber(initialData.whatsappNumber || '');
    } else {
      setCharacterName('');
      setLevel(350);
      setVocation('Knight');
      setAvailablePeriods(['Noite (18h - 00h)']);
      setAvailableDays(['Segunda', 'Quarta', 'Sexta', 'Sábado']);
      setHuntsInterest([
        { name: 'Library - Fire Section', bestiaryDone: false },
        { name: 'Buried Cathedral -3', bestiaryDone: true },
      ]);
      setHasBestiary(false);
      setBestiaryNotes('Foco em Charms e Bestiário nas hunts');
      setInterestedInProposals(true);
      setWhatsappNumber('');
    }
    setCustomPeriodInput('');
    setErrorMsg(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const togglePeriod = (p: string) => {
    playClickSound();
    setAvailablePeriods((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleAddManualPeriod = () => {
    const trimmed = customPeriodInput.trim();
    if (!trimmed) return;
    playClickSound();
    if (!availablePeriods.includes(trimmed)) {
      setAvailablePeriods((prev) => [...prev, trimmed]);
    }
    setCustomPeriodInput('');
  };

  const removePeriod = (p: string) => {
    playClickSound();
    setAvailablePeriods((prev) => prev.filter((item) => item !== p));
  };

  const toggleDay = (d: string) => {
    playClickSound();
    setAvailableDays((prev) =>
      prev.includes(d) ? prev.filter((item) => item !== d) : [...prev, d]
    );
  };

  const toggleHunt = (huntName: string) => {
    playClickSound();
    setHuntsInterest((prev) => {
      const exists = prev.some((h) => h.name === huntName);
      if (exists) {
        return prev.filter((h) => h.name !== huntName);
      } else {
        return [...prev, { name: huntName, bestiaryDone: false }];
      }
    });
  };

  const handleAddCustomHunt = () => {
    const trimmed = customHunt.trim();
    if (!trimmed) return;
    playClickSound();
    setHuntsInterest((prev) => {
      if (!prev.some((h) => h.name.toLowerCase() === trimmed.toLowerCase())) {
        return [...prev, { name: trimmed, bestiaryDone: false }];
      }
      return prev;
    });
    setCustomHunt('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!characterName.trim()) {
      setErrorMsg('Por favor informe o nome do seu personagem no Tibia.');
      return;
    }

    if (level < 1 || level > 3000) {
      setErrorMsg('Nível inválido (deve estar entre 1 e 3000).');
      return;
    }

    if (!world.trim()) {
      setErrorMsg('Por favor informe o servidor (mundo) do personagem.');
      return;
    }

    if (availablePeriods.length === 0) {
      setErrorMsg('Selecione ou adicione ao menos um horário disponível para caçar.');
      return;
    }

    // Format Bestiary Status combining checkbox state + observations
    const prefix = hasBestiary ? 'Já tem Bestiary feito' : 'Precisa de Bestiary';
    const finalBestiaryStatus = bestiaryNotes.trim()
      ? `${prefix} • ${bestiaryNotes.trim()}`
      : prefix;

    setIsSubmitting(true);
    try {
      await onSave({
        characterName: characterName.trim(),
        level: Number(level),
        vocation,
        world: 'Kalibra',
        availablePeriods,
        availableDays,
        huntsInterest,
        bestiaryStatus: finalBestiaryStatus.slice(0, 240),
        interestedInProposals,
        whatsappNumber: whatsappNumber.trim(),
      });
      playChimeSound();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao salvar personagem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Line */}
        <div
          className="h-1.5 w-full shrink-0"
          style={{
            background: `linear-gradient(90deg, ${themeConfig.primaryColor}, ${themeConfig.secondaryColor}, #a855f7)`,
          }}
        />

        {/* Header (Sticky) */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-800 bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div
              className="p-2 sm:p-2.5 rounded-xl border shrink-0"
              style={{
                backgroundColor: `${themeConfig.primaryColor}20`,
                borderColor: `${themeConfig.primaryColor}40`,
                color: themeConfig.primaryColor,
              }}
            >
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-gamer font-bold text-base sm:text-xl text-slate-100 uppercase tracking-wide">
                {initialData ? 'Editar Personagem' : 'Cadastrar Personagem'}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-sans truncate">
                Preencha os dados para encontrar sua PT perfeita
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-4 sm:p-6 space-y-5 font-sans flex-1">
            {errorMsg && (
              <div className="p-3 bg-rose-950/40 border border-rose-500/50 rounded-xl text-rose-300 text-xs flex items-center gap-2 font-gamer">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

          {/* Row 1: Nome do Personagem & Mundo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                Nome do Personagem (Tibia) <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={30}
                placeholder="Ex: Lord Blaker, Eder, Sorcerer Thais"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition shadow-inner"
              />
            </div>

            <div>
              <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                Servidor / Mundo
              </label>
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                  <span className="font-gamer font-bold text-sm sm:text-base text-slate-100 uppercase tracking-wider">
                    Kalibra
                  </span>
                </div>
                <span className="text-[10px] font-gamer font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  Servidor Fixo
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Level Atual & Votação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                Level Atual <span className="text-amber-400">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={3000}
                value={level}
                onChange={(e) => setLevel(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-lg font-mono font-bold text-amber-300 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition shadow-inner"
              />
            </div>

            <div>
              <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                Vocação <span className="text-amber-400">*</span>
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {VOCATIONS.map((voc) => {
                  const meta = VOCATION_META[voc];
                  const isSelected = vocation === voc;
                  return (
                    <button
                      key={voc}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setVocation(voc);
                      }}
                      className={`py-2 px-1 rounded-xl text-xs font-gamer font-bold border transition text-center flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? `${meta.accentColor} ring-2 ring-amber-400/50 shadow-md`
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-black">{meta.badge}</span>
                      <span className="text-[10px] truncate max-w-full font-mono">{voc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Auto-Cálculo de Faixa de Exp Share (Interactive Gaming Box) */}
          <div className="bg-slate-950/80 border border-amber-500/40 rounded-2xl p-4 shadow-inner space-y-2">
            <div className="flex items-center justify-between text-xs font-gamer">
              <span className="flex items-center gap-1.5 font-bold text-amber-400 uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-amber-400" />
                Auto-Cálculo Oficial de Share Experience:
              </span>
              <span className="text-[10px] text-slate-500 font-mono">ceil(Lv * 2/3) ~ floor(Lv * 1.5)</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <span className="font-gamer text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Nível Mínimo para Share
                </span>
                <span className="text-2xl font-black font-mono text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                  Lv. {minShareLevel}
                </span>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3">
                <span className="font-gamer text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Nível Máximo para Share
                </span>
                <span className="text-2xl font-black font-mono text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]">
                  Lv. {maxShareLevel}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 text-center font-sans">
              Seu char poderá dividir experiência com qualquer jogador entre o level <strong className="font-mono text-amber-300">{minShareLevel}</strong> e <strong className="font-mono text-amber-300">{maxShareLevel}</strong>.
            </p>
          </div>

          {/* Períodos Disponíveis (Com Opção Manual Ex: das 20h - 23h) */}
          <div className="space-y-2.5">
            <label className="block font-gamer text-xs font-bold text-slate-300 flex items-center justify-between uppercase tracking-wide">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Períodos Disponíveis para Caçar <span className="text-amber-400">*</span>
              </span>
              <span className="text-[10px] font-sans text-slate-400 normal-case">
                Selecione os blocos ou digite horários manuais
              </span>
            </label>

            {/* Standard Period Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_PERIODS.map((period) => {
                const isSelected = availablePeriods.includes(period);
                return (
                  <button
                    key={period}
                    type="button"
                    onClick={() => togglePeriod(period)}
                    className={`p-2.5 rounded-xl text-xs font-medium border text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>{period}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            {/* Manual Period Custom Input */}
            <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/90 space-y-2">
              <span className="text-[11px] font-gamer font-bold uppercase tracking-wider text-slate-400 block">
                Marcar Horário Manual Específico:
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ex: das 20h - 23h, 19h às 22h30, 21h - 01h..."
                  value={customPeriodInput}
                  onChange={(e) => setCustomPeriodInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddManualPeriod();
                    }
                  }}
                  className="flex-1 px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition shadow-inner font-sans"
                />
                <button
                  type="button"
                  onClick={handleAddManualPeriod}
                  className="gamer-btn-secondary px-3.5 py-2 rounded-xl text-xs cursor-pointer flex items-center gap-1 text-amber-300 border-amber-500/40"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar</span>
                </button>
              </div>

              {/* Quick Preset Buttons for Custom Times */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] text-slate-500 font-sans">Atalhos rápidos:</span>
                {['das 19h - 22h', 'das 20h - 23h', 'das 21h - 00h', 'das 22h - 02h'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      playClickSound();
                      if (!availablePeriods.includes(preset)) {
                        setAvailablePeriods((prev) => [...prev, preset]);
                      }
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono border transition cursor-pointer ${
                      availablePeriods.includes(preset)
                        ? 'bg-amber-500/25 text-amber-300 border-amber-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    + {preset}
                  </button>
                ))}
              </div>

              {/* Display of Active Custom Periods with Remove Option */}
              {availablePeriods.some((p) => !PRESET_PERIODS.includes(p)) && (
                <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-gamer uppercase font-bold text-amber-400">
                    Horários Manuais Ativos:
                  </span>
                  {availablePeriods
                    .filter((p) => !PRESET_PERIODS.includes(p))
                    .map((manual) => (
                      <span
                        key={manual}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-500/15 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-mono"
                      >
                        <span>{manual}</span>
                        <button
                          type="button"
                          onClick={() => removePeriod(manual)}
                          className="hover:text-rose-400 cursor-pointer ml-0.5"
                          title="Remover horário"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* Dias Disponíveis */}
          <div>
            <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              Dias Disponíveis
            </label>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map((day) => {
                const isSelected = availableDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hunts de Interesse */}
          <div className="space-y-2.5">
            <label className="block font-gamer text-xs font-bold text-slate-300 flex items-center justify-between uppercase tracking-wide">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-rose-400" />
                Hunts de Interesse (Spawns Favoritos)
              </span>
              <span className="text-[10px] font-sans text-slate-400 normal-case">
                Clique nos respawns para selecionar
              </span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1.5 bg-slate-950/70 rounded-xl border border-slate-800 mb-2">
              {POPULAR_HUNTS.map((hunt) => {
                const isSelected = huntsInterest.some((h) => h.name === hunt);
                return (
                  <button
                    key={hunt}
                    type="button"
                    onClick={() => toggleHunt(hunt)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/25 text-amber-300 border-amber-500/50'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {hunt}
                  </button>
                );
              })}
            </div>

            {/* Custom Hunt Tag Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Adicionar outro respawn customizado..."
                value={customHunt}
                onChange={(e) => setCustomHunt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomHunt();
                  }
                }}
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="button"
                onClick={handleAddCustomHunt}
                className="gamer-btn-secondary px-3 py-2 rounded-xl text-xs cursor-pointer"
              >
                + Adicionar
              </button>
            </div>

            {/* Interactive bestiary configuration per selected hunt */}
            {huntsInterest.length > 0 && (
              <div className="mt-3 bg-slate-950/80 border border-slate-800/80 p-3.5 rounded-xl space-y-2.5 shadow-inner">
                <span className="text-[10px] font-gamer font-bold uppercase tracking-wider text-rose-400 block">
                  Defina se você já tem Bestiário nos respawns escolhidos:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {huntsInterest.map((hunt, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2.5 bg-slate-900 border border-slate-800/70 rounded-lg gap-2 text-xs"
                    >
                      <span className="font-sans font-bold text-slate-200 truncate flex-1 pl-1" title={hunt.name}>
                        {hunt.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setHuntsInterest((prev) =>
                            prev.map((h) =>
                              h.name === hunt.name
                                ? { ...h, bestiaryDone: !h.bestiaryDone }
                                : h
                            )
                          );
                        }}
                        className={`px-2 py-1 rounded text-[10px] font-gamer font-bold uppercase transition cursor-pointer border ${
                          hunt.bestiaryDone
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                        }`}
                      >
                        {hunt.bestiaryDone ? '✓ Bestiário Feito' : '⚠ Falta Bestiário'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status de Bestiary / Charm Points (Checkbox se tiver + Espaço para observações) */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/90 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-gamer text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                Status de Bestiary / Charm Points
              </label>
              <span className="text-[10px] font-sans text-slate-400">
                Marcar se já tiver • Deixar desmarcado se precisar
              </span>
            </div>

            {/* Checkbox: Marcar se já tiver, deixar desmarcado se precisar */}
            <label className="flex items-start gap-3 p-3.5 bg-slate-900/90 border border-slate-700/80 rounded-xl cursor-pointer hover:border-amber-500/50 transition">
              <input
                type="checkbox"
                checked={hasBestiary}
                onChange={(e) => {
                  playClickSound();
                  setHasBestiary(e.target.checked);
                }}
                className="mt-0.5 w-5 h-5 rounded text-amber-500 focus:ring-amber-500/30 bg-slate-950 border-slate-700 cursor-pointer"
              />
              <div className="space-y-1">
                <div className="font-gamer font-bold text-xs uppercase tracking-wide flex items-center gap-1.5">
                  {hasBestiary ? (
                    <span className="text-emerald-400 flex items-center gap-1.5">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      Marcado: Já tenho Bestiary feito / Charms completos
                    </span>
                  ) : (
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <Square className="w-4 h-4 text-amber-400" />
                      Desmarcado: Preciso fazer Bestiary / Farmar Charms
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  {hasBestiary
                    ? '✓ Marcado: você já completou o bestiário dessa criatura e não precisa pontuar charms.'
                    : '✓ Desmarcado: você quer priorizar completar criaturas para ganhar Charm Points nesta hunt.'}
                </p>
              </div>
            </label>

            {/* Espaço para observações */}
            <div>
              <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                Espaço para Observações (Bestiary / Charm Points)
              </label>
              <textarea
                rows={2}
                maxLength={250}
                placeholder="Ex: Faltam 300 mobs de Fire Library, charms Low Blow, Freeze, Zap ativos, aceito rapid respawn..."
                value={bestiaryNotes}
                onChange={(e) => setBestiaryNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition shadow-inner resize-none font-sans"
              />
            </div>
          </div>

          {/* WhatsApp & Proposals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-gamer text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5 uppercase tracking-wide">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                Número de WhatsApp (DDD + Número)
              </label>
              <input
                type="text"
                placeholder="Ex: +55 11 99999-9999"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition shadow-inner font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Permite contato direto com líderes e membros da PT pelo WhatsApp.
              </span>
            </div>

            <div className="flex flex-col justify-center">
              <label className="block font-gamer text-xs font-bold text-slate-300 mb-2 uppercase tracking-wide">
                Interesse em Propostas de PT
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition">
                <input
                  type="checkbox"
                  checked={interestedInProposals}
                  onChange={(e) => setInterestedInProposals(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500/20 bg-slate-900 border-slate-700"
                />
                <span className="text-xs text-slate-300 font-medium">
                  {interestedInProposals
                    ? 'Aceito convites para hunts casuais, fixas e bosses'
                    : 'Apenas para minha party fixa'}
                </span>
              </label>
            </div>
          </div>
          </div>

          {/* Sticky Submit Buttons Footer */}
          <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/95 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                playClickSound();
                onClose();
              }}
              className="gamer-btn-secondary px-4 py-2.5 rounded-xl text-xs cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="gamer-btn-primary px-6 py-2.5 rounded-xl text-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : initialData ? 'Salvar Alterações' : 'Concluir Cadastro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
