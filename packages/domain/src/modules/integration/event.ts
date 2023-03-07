import { ES, MB } from '..'

export type FnProcessEvent = (requestId: string, userId: string, event: ES.Event.AnyEvent) => Promise<void>

export const processEvent =
  (
    persistEvent: ES.Event.FnPersistEvent,
    publishEvent: MB.FnPublishMsg,
    markEventAsSent: ES.Event.FnMarkEventAsSent
  ): FnProcessEvent =>
  async (requestId: string, userId: string, event: ES.Event.AnyEvent) => {
    await persistEvent(event)
    await publishEvent(requestId, userId, event.payload.tag, event)
    await markEventAsSent(event)
  }
