import { EventData } from '..'

// mutations
export type FnPublishEvent = (requestId: string, event: EventData.AnyEvent) => Promise<void>
export type FnPublishEvents = (
  requestId: string,
  events: EventData.AnyEvent[],
  userId?: string
) => Promise<void>
