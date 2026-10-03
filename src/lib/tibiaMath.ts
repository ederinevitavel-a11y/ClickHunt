import { Character, CharacterHunt, MatchScore, Vocation } from '../types';

/**
 * Safely extracts the hunt name string whether the input is a string or CharacterHunt object.
 */
export function getHuntName(hunt: string | CharacterHunt | any): string {
  if (!hunt) return '';
  if (typeof hunt === 'string') return hunt.trim();
  if (typeof hunt === 'object') {
    if (typeof hunt.name === 'string') return hunt.name.trim();
    if (typeof hunt.huntName === 'string') return hunt.huntName.trim();
  }
  return String(hunt).trim();
}

/**
 * Tibia Official Experience Share Formula:
 * Lowest level member must be at least ceil(HighestLevel * 2 / 3).
 * Therefore, for a given level L:
 * Minimum level eligible = ceil(L * 2 / 3)
 * Maximum level eligible = floor(L * 1.5)
 */
export function calculateShareRange(level: number): { minShareLevel: number; maxShareLevel: number } {
  const safeLevel = Math.max(1, Math.floor(level || 1));
  const minShareLevel = Math.ceil((safeLevel * 2) / 3);
  const maxShareLevel = Math.floor(safeLevel * 1.5);
  return { minShareLevel, maxShareLevel };
}

/**
 * Checks whether an arbitrary list of levels can all share experience together.
 */
export function canPartyShare(levels: number[]): {
  isShareActive: boolean;
  minLevel: number;
  maxLevel: number;
  requiredMinLevel: number;
  allowedMaxLevel: number;
} {
  if (!levels || levels.length === 0) {
    return {
      isShareActive: true,
      minLevel: 0,
      maxLevel: 0,
      requiredMinLevel: 0,
      allowedMaxLevel: 0,
    };
  }

  const minLevel = Math.min(...levels);
  const maxLevel = Math.max(...levels);
  const requiredMinLevel = Math.ceil((maxLevel * 2) / 3);
  const allowedMaxLevel = Math.floor(minLevel * 1.5);
  const isShareActive = minLevel >= requiredMinLevel;

  return {
    isShareActive,
    minLevel,
    maxLevel,
    requiredMinLevel,
    allowedMaxLevel,
  };
}

/**
 * Checks if two individual characters are within mutual exp share range.
 */
export function isLevelInShareRange(myLevel: number, targetLevel: number): boolean {
  if (!myLevel || !targetLevel) return false;
  const { minShareLevel, maxShareLevel } = calculateShareRange(myLevel);
  return targetLevel >= minShareLevel && targetLevel <= maxShareLevel;
}

/**
 * Helper to parse a time string and return an approximate [startHour, endHour] range (0-48).
 */
export function parseHourRange(periodStr: string): [number, number] | null {
  if (!periodStr || typeof periodStr !== 'string') return null;
  const lower = periodStr.toLowerCase();
  if (lower.includes('manhã') || lower.includes('manha')) return [6, 12];
  if (lower.includes('tarde')) return [12, 18];
  if (lower.includes('noite')) return [18, 24];
  if (lower.includes('madrugada')) return [0, 6];

  // Extract numbers like "das 20h - 23h", "20:00 - 23:00", "20h às 23h", "20 - 23"
  const numbers = periodStr.match(/\b([01]?\d|2[0-3])(?:h|:00)?\b/gi);
  if (numbers && numbers.length >= 2) {
    let start = parseInt(numbers[0].replace(/\D/g, ''), 10);
    let end = parseInt(numbers[1].replace(/\D/g, ''), 10);
    if (!isNaN(start) && !isNaN(end)) {
      if (end <= start) {
        end += 24; // wraps past midnight, e.g. 22h to 02h
      }
      return [start, end];
    }
  }
  return null;
}

/**
 * Checks whether two availability periods overlap in time.
 */
export function doPeriodsOverlap(p1: string, p2: string): boolean {
  if (!p1 || !p2 || typeof p1 !== 'string' || typeof p2 !== 'string') return false;
  if (p1.trim().toLowerCase() === p2.trim().toLowerCase()) return true;
  if (p1.toLowerCase().includes(p2.toLowerCase()) || p2.toLowerCase().includes(p1.toLowerCase())) return true;

  const range1 = parseHourRange(p1);
  const range2 = parseHourRange(p2);

  if (range1 && range2) {
    const [start1, end1] = range1;
    const [start2, end2] = range2;
    // Overlap condition: start1 < end2 && start2 < end1
    return Math.max(start1, start2) < Math.min(end1, end2);
  }

  return false;
}

/**
 * Calculates synergy score (0 - 100) between two characters.
 */
export function calculateSynergy(myChar: Character, otherChar: Character): MatchScore {
  const details: string[] = [];
  let score = 0;

  // 1. World Check (Missclick PTs is dedicated to Kalibra)
  const myWorld = String(myChar.world || 'Kalibra').toLowerCase().trim();
  const otherWorld = String(otherChar.world || 'Kalibra').toLowerCase().trim();
  const isKalibra = myWorld === 'kalibra' && otherWorld === 'kalibra';
  const sameWorld = isKalibra || myWorld === otherWorld;
  if (sameWorld) {
    score += 25;
    details.push(`Servidor Kalibra`);
  } else {
    details.push(`Servidor diferente (${otherChar.world})`);
  }

  // 2. Share Level Range Check (Crucial for Tibia party hunt)
  const isShareEligible = isLevelInShareRange(myChar.level, otherChar.level);
  if (isShareEligible) {
    score += 35;
    details.push(`Faixa de Share Compatível (Lv ${otherChar.level})`);
  } else {
    details.push(`Fora do Share (requer Lv ${myChar.minShareLevel} - ${myChar.maxShareLevel})`);
  }

  // 3. Vocation Synergy (Different vocations build 4-voc or 5-voc PT bonus)
  const vocationSynergy = myChar.vocation !== otherChar.vocation;
  if (vocationSynergy) {
    score += 15;
    details.push(`Vocação complementar (${otherChar.vocation})`);
  } else {
    details.push(`Mesma vocação (${otherChar.vocation})`);
  }

  // 4. Period Overlap (Smart match supporting manual periods like "das 20h - 23h")
  const matchedPeriods: string[] = [];
  (myChar.availablePeriods || []).forEach((p1) => {
    (otherChar.availablePeriods || []).forEach((p2) => {
      if (typeof p1 === 'string' && typeof p2 === 'string' && doPeriodsOverlap(p1, p2)) {
        const label = p1 === p2 ? p1 : `${p1} ≈ ${p2}`;
        if (!matchedPeriods.includes(label)) {
          matchedPeriods.push(label);
        }
      }
    });
  });

  if (matchedPeriods.length > 0) {
    score += 10;
    details.push(`Horários em comum: ${matchedPeriods.slice(0, 2).join(', ')}`);
  }

  // 5. Day Overlap
  const dayOverlap = (myChar.availableDays || []).filter((d) =>
    (otherChar.availableDays || []).includes(d)
  );
  if (dayOverlap.length > 0) {
    score += 5;
    details.push(`Dias em comum: ${dayOverlap.slice(0, 3).join(', ')}${dayOverlap.length > 3 ? '...' : ''}`);
  }

  // 6. Hunt Target Overlap (Safely supports strings and CharacterHunt objects)
  const myHunts = (myChar.huntsInterest || []).map(getHuntName).filter(Boolean);
  const otherHunts = (otherChar.huntsInterest || []).map(getHuntName).filter(Boolean);

  const huntOverlap = myHunts.filter((h) =>
    otherHunts.some((oh) => {
      const hLower = h.toLowerCase();
      const ohLower = oh.toLowerCase();
      return ohLower.includes(hLower) || hLower.includes(ohLower);
    })
  );
  if (huntOverlap.length > 0) {
    score += 10;
    details.push(`Hunts de interesse: ${huntOverlap.slice(0, 2).join(', ')}`);
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    isShareEligible,
    sameWorld,
    vocationSynergy,
    periodOverlap: matchedPeriods,
    dayOverlap,
    huntOverlap,
    details,
  };
}

/**
 * Sanitizes and normalizes phone numbers for WhatsApp API / wa.me URLs.
 * Automatically handles Brazilian phone numbers by adding country code 55 if omitted.
 */
export function sanitizeWhatsAppNumber(phone: string): string {
  if (!phone) return '';
  let clean = phone.replace(/\D/g, '');
  
  // Remove leading 0 if entered (e.g. 035992451052 -> 35992451052)
  if (clean.startsWith('0')) {
    clean = clean.substring(1);
  }

  // Brazilian mobile numbers usually have 10 digits (DDD + 8 digits) or 11 digits (DDD + 9 digits)
  // E.g. 35992451052 (11 digits) -> add 55 -> 5535992451052
  // E.g. 11987654321 (11 digits) -> add 55 -> 5511987654321
  if ((clean.length === 10 || clean.length === 11) && !clean.startsWith('55')) {
    clean = `55${clean}`;
  }

  return clean;
}

/**
 * Visual formatter mask for phone inputs (Brazilian format: (DD) 9XXXX-XXXX)
 */
export function formatPhoneMask(value: string): string {
  let clean = value.replace(/\D/g, '');

  // Strip international prefix if typing
  if (clean.startsWith('55') && clean.length > 11) {
    clean = clean.substring(2);
  }

  if (clean.length > 11) {
    clean = clean.substring(0, 11);
  }

  if (clean.length <= 2) {
    return clean ? `(${clean}` : '';
  }
  if (clean.length <= 6) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2)}`;
  }
  if (clean.length <= 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7, 11)}`;
}

export function buildWhatsAppLink(
  phoneNumber: string,
  myCharName: string,
  myVoc: string,
  myLevel: number,
  targetCharName: string,
  huntTarget?: string
): string {
  const cleanPhone = sanitizeWhatsAppNumber(phoneNumber);
  if (!cleanPhone) return '#';
  const message = `Hail ${targetCharName}! Vi seu perfil no ClickHunt Kalibra. Sou o ${myCharName} (Lv ${myLevel} ${myVoc}). Tem interesse em fechar PT${
    huntTarget ? ` para ${huntTarget}` : ''
  }?`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildDirectWhatsAppLink(phoneNumber: string, customMessage?: string): string {
  const cleanPhone = sanitizeWhatsAppNumber(phoneNumber);
  if (!cleanPhone) return '#';
  if (customMessage) {
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customMessage)}`;
  }
  return `https://wa.me/${cleanPhone}`;
}

export const DEFAULT_WORLD = 'Kalibra';

export const POPULAR_WORLDS = ['Kalibra'];

export const POPULAR_HUNTS = [
  'Soul War - Crater',
  'Soul War - Rotten Wasteland',
  'Soul War - Dark Thais',
  'Soul War - Claustrophobic Inferno',
  'Rotten Blood - Bakragore',
  'Rotten Blood - Jaded Roots',
  'Library - Fire Section',
  'Library - Energy Section',
  'Library - Ice Section',
  'Nagás - Temple / Coastal',
  'Issavi - Sphinx & Goannas',
  'Bullita - Ingol',
  'Cobalt Cathedral',
  'Buried Cathedral -3',
  'Nightmare Isles',
  'Asura Palace & Vaults',
  'Gazer Spectres',
  'Ripper Spectres',
  'Buraster Spectres',
  'Catacombs (Oramond)',
  'Prison -3',
  'Deathlings',
  'Skeleton Elite Warriors',
  'Winter Court (Elves)',
  'Summer Court (Elves)',
  'Carnivors -3',
  'Hero Cave (Edron)',
  'Barkless Cultists',
  'Draken Walls',
];

export const VOCATION_META: Record<
  Vocation,
  {
    name: string;
    badge: string;
    role: string;
    description: string;
    gradient: string;
    accentColor: string;
    borderColor: string;
    textColor: string;
    neonColor: string;
    hexColor: string;
    glowShadow: string;
  }
> = {
  Knight: {
    name: 'Elite Knight',
    badge: 'EK',
    role: 'Blocker & Frontline',
    description: 'Controle de monstros, Exeta Res, lida com todo dano físico e mantém os monstros no box.',
    gradient: 'from-slate-600/20 via-slate-900/10 to-transparent',
    accentColor: 'bg-slate-500/15 text-slate-400 border-slate-500/40',
    borderColor: 'border-slate-500/50 hover:border-slate-400',
    textColor: 'text-slate-400',
    neonColor: '#94a3b8',
    hexColor: '#94a3b8',
    glowShadow: 'shadow-[0_0_20px_-3px_rgba(148,163,184,0.35)]',
  },
  Paladin: {
    name: 'Royal Paladin',
    badge: 'RP',
    role: 'Off-Tank & AoE / Single DPS',
    description: 'Diamond arrows + Divine Caldera (Mas San). Dano em área pesado e ajuda no box.',
    gradient: 'from-yellow-600/20 via-yellow-900/10 to-transparent',
    accentColor: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/40',
    borderColor: 'border-yellow-500/50 hover:border-yellow-400',
    textColor: 'text-yellow-400',
    neonColor: '#eab308',
    hexColor: '#eab308',
    glowShadow: 'shadow-[0_0_20px_-3px_rgba(234,179,8,0.35)]',
  },
  Sorcerer: {
    name: 'Master Sorcerer',
    badge: 'MS',
    role: 'Wave Burst & Debuff Support',
    description: 'Sap Strength (reduz dano dos monstros), Exevo Gran Mas Flam/Vis e ondas destrutivas.',
    gradient: 'from-red-600/20 via-red-900/10 to-transparent',
    accentColor: 'bg-red-500/15 text-red-400 border-red-500/40',
    borderColor: 'border-red-500/50 hover:border-red-400',
    textColor: 'text-red-400',
    neonColor: '#ef4444',
    hexColor: '#ef4444',
    glowShadow: 'shadow-[0_0_20px_-3px_rgba(239,68,68,0.35)]',
  },
  Druid: {
    name: 'Elder Druid',
    badge: 'ED',
    role: 'Main Healer & Element Burst',
    description: 'Cura primordial da party (Exura Sio no Blocker), Mass Healing e dano de Gelo/Terra.',
    gradient: 'from-blue-600/20 via-blue-900/10 to-transparent',
    accentColor: 'bg-blue-500/15 text-blue-400 border-blue-500/40',
    borderColor: 'border-blue-500/50 hover:border-blue-400',
    textColor: 'text-blue-400',
    neonColor: '#3b82f6',
    hexColor: '#3b82f6',
    glowShadow: 'shadow-[0_0_20px_-3px_rgba(59,130,246,0.35)]',
  },
  Monk: {
    name: 'Exalted Monk',
    badge: 'MN',
    role: 'Support, Bruiser & Stance Utility',
    description: 'Equilíbrio físico e espiritual, suporte em combate corpo-a-corpo e utilidade estratégica na PT.',
    gradient: 'from-purple-600/20 via-purple-900/10 to-transparent',
    accentColor: 'bg-purple-500/15 text-purple-400 border-purple-500/40',
    borderColor: 'border-purple-500/50 hover:border-purple-400',
    textColor: 'text-purple-400',
    neonColor: '#a855f7',
    hexColor: '#a855f7',
    glowShadow: 'shadow-[0_0_20px_-3px_rgba(168,85,247,0.35)]',
  },
};
