# Security Specification - Missclick PTs

## 1. Data Invariants

1. **Character Ownership Invariant**: A character profile can only be created, modified, or deleted by the authenticated user whose `request.auth.uid` matches `ownerId`.
2. **Identity Integrity**: Users cannot forge or spoof another player's UID as `ownerId`, `fromUserId`, or `leaderId`.
3. **Verified Authentication**: All state-modifying writes (create, update, delete) require a signed-in user with verified email or authenticated Google credential.
4. **Vocation & Level Validation**: Level must be a positive integer (>= 1 and <= 3000). Vocation must be one of `['Knight', 'Paladin', 'Sorcerer', 'Druid', 'Monk']`.
5. **Party Share Formula Mathematical Consistency**: `minShareLevel` must equal `ceil(level * 2 / 3)` and `maxShareLevel` must equal `floor(level * 1.5)`.
6. **Party Membership & Leadership Invariant**: Only the party leader can disband or modify party details; members can update membership array when joining or leaving with valid action keys.
7. **Invite Privacy Invariant**: An invitation can only be read or responded to by the recipient (`toUserId`) or the sender (`fromUserId`).
8. **Size & Input Boundedness**: All string fields have strict character length constraints; arrays are bounded to prevent resource exhaustion attacks.
9. **No Ghost Fields**: Payloads must contain only allowed keys defined in the schema.

## 2. The Dirty Dozen Payloads (Designed to be Rejected)

1. **DD-1: Character Identity Spoofing**: Attempt to create a character setting `ownerId: "victim_uid"` while authenticated as `attacker_uid`. -> REJECT
2. **DD-2: Character Level Overflow / Denial of Wallet**: Character payload with `level: -50` or `level: 9999999`. -> REJECT
3. **DD-3: Invalid Vocation Injection**: Character payload with `vocation: "Admin"` or `vocation: "GameMaster"`. -> REJECT
4. **DD-4: Shadow Field Injection in Character**: Payload containing `{ ..., isSuperAdmin: true, vipAccess: true }`. -> REJECT
5. **DD-5: Character String Bloat Attack**: `characterName` or `notes` containing a 100KB string payload. -> REJECT
6. **DD-6: Unauthenticated Character Read/Write**: Unauthenticated request attempting to create or update a character. -> REJECT
7. **DD-7: Invite Impersonation**: Attacker creates a party invite setting `fromUserId: "innocent_player"`. -> REJECT
8. **DD-8: Invite Snoop Attack**: Attacker attempts to read `/invites/{inviteId}` where neither `fromUserId` nor `toUserId` matches attacker's UID. -> REJECT
9. **DD-9: Invite State Tampering**: Attacker sets status to `"accepted"` on an invite where attacker is the sender (only receiver can accept). -> REJECT
10. **DD-10: Party Leader Hijack**: Non-leader attempts to update party metadata or change `leaderId`. -> REJECT
11. **DD-11: Invalid Target Size for Party**: Party created with `targetSize: 1` or `targetSize: 10` (must be 4 or 5). -> REJECT
12. **DD-12: Arbitrary Array Expansion Attack**: Attempt to append 500 tags to `huntsInterest` or `availablePeriods`. -> REJECT
