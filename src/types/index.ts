export type Vocation = 'Knight' | 'Paladin' | 'Sorcerer' | 'Druid' | 'Monk';

export type PartySize = 4 | 5;

export interface CharacterHunt {
  name: string;
  bestiaryDone: boolean;
}

export interface Character {
  id: string;
  ownerId: string;
  ownerEmail: string;
  characterName: string;
  level: number;
  vocation: Vocation;
  world: string;
  minShareLevel: number;
  maxShareLevel: number;
  availablePeriods: string[];
  availableDays: string[];
  huntsInterest: (string | CharacterHunt)[];
  bestiaryStatus: string;
  interestedInProposals: boolean;
  whatsappNumber: string;
  createdAt: string;
  updatedAt: string;
  approved: boolean;
}

export interface PartyInvite {
  id: string;
  fromUserId: string;
  fromCharName: string;
  toUserId: string;
  toCharName: string;
  huntTarget: string;
  scheduledTime: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface PartyMember {
  userId: string;
  characterName: string;
  vocation: Vocation;
  level: number;
  isLeader: boolean;
  whatsappNumber?: string;
}

export interface Party {
  id: string;
  leaderId: string;
  leaderCharName: string;
  world: string;
  targetSize: number;
  huntTarget: string;
  scheduledTime: string;
  status: 'recruiting' | 'full' | 'hunting' | 'completed';
  minPartyLevel: number;
  maxPartyLevel: number;
  isShareActive: boolean;
  members: PartyMember[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MatchScore {
  score: number;
  isShareEligible: boolean;
  sameWorld: boolean;
  vocationSynergy: boolean;
  periodOverlap: string[];
  dayOverlap: string[];
  huntOverlap: string[];
  details: string[];
}
