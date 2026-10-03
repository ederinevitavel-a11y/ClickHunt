import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  where,
  or,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { Character, Party, PartyInvite, PartyMember, Vocation } from '../types';
import { calculateShareRange, canPartyShare } from '../lib/tibiaMath';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

interface PartyDataContextType {
  characters: Character[];
  myCharacters: Character[];
  selectedCharacter: Character | null;
  setSelectedCharacter: (char: Character | null) => void;
  loadingData: boolean;
  parties: Party[];
  invites: PartyInvite[];
  receivedInvites: PartyInvite[];
  sentInvites: PartyInvite[];
  organizedParties: any[];
  isAdmin: boolean;
  isApprovedUser: boolean;
  approvedUsers: any[];
  approveUserAndCharacter: (charId: string) => Promise<void>;
  revokeUserApproval: (userId: string) => Promise<void>;
  createCharacter: (data: Omit<Character, 'id' | 'ownerId' | 'ownerEmail' | 'minShareLevel' | 'maxShareLevel' | 'createdAt' | 'updatedAt' | 'approved'>) => Promise<string>;
  updateCharacter: (id: string, data: Partial<Character>) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  sendPartyInvite: (targetChar: Character, huntTarget: string, scheduledTime: string, message?: string) => Promise<void>;
  respondToInvite: (inviteId: string, status: 'accepted' | 'declined') => Promise<void>;
  cancelInvite: (inviteId: string) => Promise<void>;
  createParty: (partyData: {
    targetSize: 4 | 5;
    huntTarget: string;
    scheduledTime: string;
    world: string;
    notes?: string;
  }) => Promise<string>;
  joinParty: (partyId: string, member: PartyMember) => Promise<void>;
  leaveParty: (partyId: string) => Promise<void>;
  disbandParty: (partyId: string) => Promise<void>;
}

const PartyDataContext = createContext<PartyDataContextType | undefined>(undefined);

export const PartyDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [parties, setParties] = useState<Party[]>([]);
  const [invites, setInvites] = useState<PartyInvite[]>([]);
  const [organizedParties, setOrganizedParties] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [approvedUsers, setApprovedUsers] = useState<any[]>([]);

  const isAdmin = user?.email === 'ederinevitavel@gmail.com';

  // 1. Listen to Characters when signed in
  useEffect(() => {
    if (!user) {
      setCharacters([]);
      setSelectedCharacter(null);
      setParties([]);
      setInvites([]);
      setLoadingData(false);
      return;
    }

    setLoadingData(true);
    const charsPath = 'characters';
    const unsubscribeChars = onSnapshot(
      collection(db, charsPath),
      (snapshot) => {
        const loaded: Character[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...(docSnap.data() as Omit<Character, 'id'>) });
        });
        // Sort by level descending
        loaded.sort((a, b) => b.level - a.level);
        setCharacters(loaded);
        setLoadingData(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, charsPath);
      }
    );

    // 2. Listen to Parties
    const partiesPath = 'parties';
    const unsubscribeParties = onSnapshot(
      collection(db, partiesPath),
      (snapshot) => {
        const loaded: Party[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...(docSnap.data() as Omit<Party, 'id'>) });
        });
        // Sort by creation desc
        loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setParties(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, partiesPath);
      }
    );

    // 3. Listen to Invites for current user
    const invitesPath = 'invites';
    const qInvites = query(
      collection(db, invitesPath),
      or(
        where('fromUserId', '==', user.uid),
        where('toUserId', '==', user.uid)
      )
    );
    const unsubscribeInvites = onSnapshot(
      qInvites,
      (snapshot) => {
        const loaded: PartyInvite[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Omit<PartyInvite, 'id'>;
          // The query already filters for this user, but we keep this for consistency
          if (data.fromUserId === user.uid || data.toUserId === user.uid) {
            loaded.push({ id: docSnap.id, ...data });
          }
        });
        loaded.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setInvites(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, invitesPath);
      }
    );

    // 4. Listen to Organized Parties if Admin
    const isCurrentUserAdmin = user.email === 'ederinevitavel@gmail.com';
    let unsubscribeOrganized = () => {};

    if (isCurrentUserAdmin) {
      const orgPath = 'organized_parties';
      unsubscribeOrganized = onSnapshot(
        collection(db, orgPath),
        (snapshot) => {
          const loaded: any[] = [];
          snapshot.forEach((docSnap) => {
            loaded.push({ id: docSnap.id, ...docSnap.data() });
          });
          loaded.sort((a, b) => new Date(b.organizedAt).getTime() - new Date(a.organizedAt).getTime());
          setOrganizedParties(loaded);
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, orgPath);
        }
      );
    } else {
      setOrganizedParties([]);
    }

    // 5. Listen to Approved Users
    const appUsersPath = 'approved_users';
    const unsubscribeAppUsers = onSnapshot(
      collection(db, appUsersPath),
      (snapshot) => {
        const loaded: any[] = [];
        snapshot.forEach((docSnap) => {
          loaded.push({ id: docSnap.id, ...docSnap.data() });
        });
        setApprovedUsers(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, appUsersPath);
      }
    );

    return () => {
      unsubscribeChars();
      unsubscribeParties();
      unsubscribeInvites();
      unsubscribeOrganized();
      unsubscribeAppUsers();
    };
  }, [user]);

  // Derived: Current user's characters
  const myCharacters = characters.filter((c) => c.ownerId === user?.uid);

  // Auto-select first character if none selected or if selected was deleted
  useEffect(() => {
    if (myCharacters.length > 0) {
      if (!selectedCharacter || !myCharacters.some((c) => c.id === selectedCharacter.id)) {
        setSelectedCharacter(myCharacters[0]);
      }
    } else {
      setSelectedCharacter(null);
    }
  }, [myCharacters, selectedCharacter]);

  // Derived invites
  const receivedInvites = invites.filter((inv) => inv.toUserId === user?.uid);
  const sentInvites = invites.filter((inv) => inv.fromUserId === user?.uid);

  // User Verification and Status helpers
  const isApprovedUser = React.useMemo(() => {
    if (!user) return false;
    if (user.email === 'ederinevitavel@gmail.com') return true;
    return approvedUsers.some(
      (u) => u.uid === user.uid || u.email?.toLowerCase() === user.email?.toLowerCase()
    );
  }, [user, approvedUsers]);

  const approveUserAndCharacter = async (charId: string) => {
    if (!user || !isAdmin) return;
    const char = characters.find((c) => c.id === charId);
    if (!char) return;

    const now = new Date().toISOString();
    const ownerEmail = char.ownerEmail || 'unknown@clickhunt.com';
    const ownerId = char.ownerId || `user_${Date.now()}`;

    // 1. Approve the character
    await updateDoc(doc(db, 'characters', charId), {
      approved: true,
      updatedAt: now,
      ownerEmail: ownerEmail // ensure ownerEmail is written if it was missing in old doc
    });

    // 2. Add user to approved_users
    const appUserPayload = {
      email: ownerEmail,
      uid: ownerId,
      approvedAt: now,
      approvedBy: user.email || ''
    };
    await setDoc(doc(db, 'approved_users', ownerId), appUserPayload);
  };

  const revokeUserApproval = async (userId: string) => {
    if (!user || !isAdmin) return;
    await deleteDoc(doc(db, 'approved_users', userId));
  };

  // Character Actions
  const createCharacter = async (
    data: Omit<Character, 'id' | 'ownerId' | 'ownerEmail' | 'minShareLevel' | 'maxShareLevel' | 'createdAt' | 'updatedAt' | 'approved'>
  ): Promise<string> => {
    if (!user) throw new Error('É necessário estar autenticado com Google.');
    const charId = `char_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const { minShareLevel, maxShareLevel } = calculateShareRange(data.level);
    const now = new Date().toISOString();

    const newChar: Omit<Character, 'id'> = {
      ...data,
      world: 'Kalibra',
      ownerId: user.uid,
      ownerEmail: user.email || '',
      minShareLevel,
      maxShareLevel,
      createdAt: now,
      updatedAt: now,
      approved: isApprovedUser,
    };

    const path = `characters/${charId}`;
    try {
      await setDoc(doc(db, 'characters', charId), newChar);
      return charId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const updateCharacter = async (id: string, data: Partial<Character>) => {
    if (!user) return;
    const existing = characters.find((c) => c.id === id);
    if (!existing) return;

    const level = data.level !== undefined ? data.level : existing.level;
    const { minShareLevel, maxShareLevel } = calculateShareRange(level);
    const now = new Date().toISOString();

    const updatePayload: Record<string, unknown> = {
      ...data,
      level,
      minShareLevel,
      maxShareLevel,
      updatedAt: now,
    };

    const path = `characters/${id}`;
    try {
      await updateDoc(doc(db, 'characters', id), updatePayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const deleteCharacter = async (id: string) => {
    if (!user) return;
    const path = `characters/${id}`;
    try {
      await deleteDoc(doc(db, 'characters', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Invites Actions
  const sendPartyInvite = async (
    targetChar: Character,
    huntTarget: string,
    scheduledTime: string,
    message?: string
  ) => {
    if (!user || !selectedCharacter) {
      throw new Error('Selecione seu personagem antes de enviar convite.');
    }
    const inviteId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const newInvite: Omit<PartyInvite, 'id'> = {
      fromUserId: user.uid,
      fromCharName: selectedCharacter.characterName,
      toUserId: targetChar.ownerId,
      toCharName: targetChar.characterName,
      huntTarget,
      scheduledTime,
      message: message || '',
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    const path = `invites/${inviteId}`;
    try {
      await setDoc(doc(db, 'invites', inviteId), newInvite);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const respondToInvite = async (inviteId: string, status: 'accepted' | 'declined') => {
    if (!user) return;
    const now = new Date().toISOString();
    const path = `invites/${inviteId}`;
    try {
      await updateDoc(doc(db, 'invites', inviteId), {
        status,
        updatedAt: now,
      });

      if (status === 'accepted') {
        const invite = invites.find((i) => i.id === inviteId);
        if (invite) {
          // Log to organized_parties
          const organizedId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await setDoc(doc(db, 'organized_parties', organizedId), {
            partyId: inviteId,
            leaderCharName: invite.fromCharName,
            huntTarget: invite.huntTarget,
            scheduledTime: invite.scheduledTime,
            targetSize: 2, // duo match representational
            members: [
              { userId: invite.fromUserId, characterName: invite.fromCharName, vocation: '', level: 0 },
              { userId: invite.toUserId, characterName: invite.toCharName, vocation: '', level: 0 },
            ],
            organizedAt: now,
          });

          // Delete the receiving character (to make them unavailable in matching roster)
          const charToDelete = characters.find(
            (c) => c.characterName === invite.toCharName && c.ownerId === invite.toUserId
          );
          if (charToDelete) {
            await deleteDoc(doc(db, 'characters', charToDelete.id));
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const cancelInvite = async (inviteId: string) => {
    if (!user) return;
    const path = `invites/${inviteId}`;
    try {
      await deleteDoc(doc(db, 'invites', inviteId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  // Party Actions
  const createParty = async (partyData: {
    targetSize: 4 | 5;
    huntTarget: string;
    scheduledTime: string;
    world: string;
    notes?: string;
  }): Promise<string> => {
    if (!user || !selectedCharacter) {
      throw new Error('Selecione seu personagem para liderar a Party.');
    }
    const partyId = `party_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const initialMember: PartyMember = {
      userId: user.uid,
      characterName: selectedCharacter.characterName,
      vocation: selectedCharacter.vocation,
      level: selectedCharacter.level,
      isLeader: true,
      whatsappNumber: selectedCharacter.whatsappNumber,
    };

    const shareCheck = canPartyShare([selectedCharacter.level]);

    const newParty: Omit<Party, 'id'> = {
      leaderId: user.uid,
      leaderCharName: selectedCharacter.characterName,
      world: 'Kalibra',
      targetSize: partyData.targetSize,
      huntTarget: partyData.huntTarget,
      scheduledTime: partyData.scheduledTime,
      status: 'recruiting',
      minPartyLevel: shareCheck.minLevel,
      maxPartyLevel: shareCheck.maxLevel,
      isShareActive: shareCheck.isShareActive,
      members: [initialMember],
      notes: partyData.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    const path = `parties/${partyId}`;
    try {
      await setDoc(doc(db, 'parties', partyId), newParty);
      return partyId;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const joinParty = async (partyId: string, member: PartyMember) => {
    if (!user) return;
    const targetParty = parties.find((p) => p.id === partyId);
    if (!targetParty) return;

    if (targetParty.members.some((m) => m.userId === user.uid)) {
      throw new Error('Você já está nesta Party!');
    }

    if (targetParty.members.length >= targetParty.targetSize) {
      throw new Error('Esta Party já está lotada!');
    }

    const updatedMembers = [...targetParty.members, member];
    const isNowFull = updatedMembers.length >= targetParty.targetSize;
    const levels = updatedMembers.map((m) => m.level);
    const shareCheck = canPartyShare(levels);
    const now = new Date().toISOString();

    const path = `parties/${partyId}`;
    try {
      await updateDoc(doc(db, 'parties', partyId), {
        members: updatedMembers,
        status: isNowFull ? 'full' : 'recruiting',
        minPartyLevel: shareCheck.minLevel,
        maxPartyLevel: shareCheck.maxLevel,
        isShareActive: shareCheck.isShareActive,
        updatedAt: now,
      });

      if (isNowFull) {
        // Log to organized_parties
        const organizedId = `org_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await setDoc(doc(db, 'organized_parties', organizedId), {
          partyId,
          leaderCharName: targetParty.leaderCharName,
          huntTarget: targetParty.huntTarget,
          scheduledTime: targetParty.scheduledTime,
          targetSize: targetParty.targetSize,
          members: updatedMembers.map((m) => ({
            userId: m.userId,
            characterName: m.characterName,
            vocation: m.vocation || '',
            level: m.level || 0,
          })),
          organizedAt: now,
        });

        // Delete characters of all members in the newly formed full party from the roster
        for (const m of updatedMembers) {
          const charToDelete = characters.find(
            (c) => c.characterName === m.characterName && c.ownerId === m.userId
          );
          if (charToDelete) {
            await deleteDoc(doc(db, 'characters', charToDelete.id));
          }
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const leaveParty = async (partyId: string) => {
    if (!user) return;
    const targetParty = parties.find((p) => p.id === partyId);
    if (!targetParty) return;

    // If leader leaves and members exist, transfer or disband
    if (targetParty.leaderId === user.uid) {
      if (targetParty.members.length <= 1) {
        await disbandParty(partyId);
        return;
      }
    }

    const updatedMembers = targetParty.members.filter((m) => m.userId !== user.uid);
    const levels = updatedMembers.map((m) => m.level);
    const shareCheck = canPartyShare(levels);
    const now = new Date().toISOString();

    const path = `parties/${partyId}`;
    try {
      await updateDoc(doc(db, 'parties', partyId), {
        members: updatedMembers,
        status: 'recruiting',
        minPartyLevel: shareCheck.minLevel,
        maxPartyLevel: shareCheck.maxLevel,
        isShareActive: shareCheck.isShareActive,
        updatedAt: now,
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const disbandParty = async (partyId: string) => {
    if (!user) return;
    const path = `parties/${partyId}`;
    try {
      await deleteDoc(doc(db, 'parties', partyId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  return (
    <PartyDataContext.Provider
      value={{
        characters,
        myCharacters,
        selectedCharacter,
        setSelectedCharacter,
        loadingData,
        parties,
        invites,
        receivedInvites,
        sentInvites,
        organizedParties,
        isAdmin,
        isApprovedUser,
        approvedUsers,
        approveUserAndCharacter,
        revokeUserApproval,
        createCharacter,
        updateCharacter,
        deleteCharacter,
        sendPartyInvite,
        respondToInvite,
        cancelInvite,
        createParty,
        joinParty,
        leaveParty,
        disbandParty,
      }}
    >
      {children}
    </PartyDataContext.Provider>
  );
};

export const usePartyData = (): PartyDataContextType => {
  const context = useContext(PartyDataContext);
  if (!context) {
    throw new Error('usePartyData must be used within a PartyDataProvider');
  }
  return context;
};
