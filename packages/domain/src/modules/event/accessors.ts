import { AnyEvent } from './models'

// mutations
export type FnPublishEvent = (requestId: string, event: AnyEvent) => Promise<void>
export type FnPublishEvents = (
  requestId: string,
  events: AnyEvent[],
  userId?: string
) => Promise<void>
