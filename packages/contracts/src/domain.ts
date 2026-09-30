// I2+ vocabulary; these types do not imply persistence or authorization is implemented.
export type Role = 'ADMIN' | 'COORDINATOR' | 'MEMBER' | 'GUEST';
export type EmptyPolicy = 'KEEP_UNTIL_DEADLINE' | 'CLOSE_WHEN_EMPTY';
export type SessionState = 'EMPTY' | 'WAITING' | 'COLLABORATIVE';
export type ConversationMode = 'NONE' | 'PROXIMITY' | 'AMBIENT' | 'GROUP' | 'MEETING';
export interface Membership { teamId: string; userId: string; role: Role; delegatedCapabilities: string[] }
export interface Office { officeId: string; teamId: string; mapVersion: string; name: string }
export interface AccessDay {
  dayId: string; officeId: string; openAt: string; baseCloseAt: string; effectiveCloseAt: string;
  emptyPolicy: EmptyPolicy; status: 'SCHEDULED' | 'OPEN' | 'CLOSED'; revision: number;
}
export interface OfficeSession { sessionId: string; dayId: string; epoch: number; state: SessionState }
