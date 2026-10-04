// Demo v2 vocabulary. Session services and server-side limits are still pending I2.
export const MAX_SESSION_PARTICIPANTS = 10;
export type SessionState = 'EMPTY' | 'WAITING' | 'COLLABORATIVE' | 'CLOSED';
export type PresenceState = 'CONNECTED' | 'RECONNECTING';
export type ConversationMode = 'NONE' | 'PROXIMITY' | 'AMBIENT';
export interface Participant {
  participantId: string;
  sessionId: string;
  displayName: string;
  avatarId: string;
  clothingColor: string;
}
export interface OfficeSession {
  sessionId: string;
  mapVersion: string;
  epoch: number;
  state: SessionState;
}
