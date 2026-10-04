export const PROTOCOL_VERSION = 1;
// Proposed envelope for I2. Actor and session come from a validated temporary participant credential.
export interface CommandEnvelope<T extends string, P> {
  protocolVersion: 1; type: T; sessionId: string; epoch: number;
  requestId: string; expectedRevision: number; payload: P;
}
export type DoorSetCommand = CommandEnvelope<'DOOR_SET', { doorId: string; open: boolean }>;
export const doorSetSchema = {
  type: 'object', additionalProperties: false,
  required: ['protocolVersion', 'type', 'sessionId', 'epoch', 'requestId', 'expectedRevision', 'payload'],
  properties: {
    protocolVersion: { const: 1 }, type: { const: 'DOOR_SET' },
    sessionId: { type: 'string', minLength: 1, maxLength: 128 },
    epoch: { type: 'integer', minimum: 1 }, requestId: { type: 'string', minLength: 1, maxLength: 128 },
    expectedRevision: { type: 'integer', minimum: 0 },
    payload: { type: 'object', additionalProperties: false, required: ['doorId', 'open'], properties: {
      doorId: { type: 'string', minLength: 1, maxLength: 128 }, open: { type: 'boolean' }
    } }
  }
} as const;
