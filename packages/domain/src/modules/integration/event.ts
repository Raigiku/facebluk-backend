import { ES, MB } from '..'

export type FnProcessEvent = (event: ES.Event.AnyEvent) => Promise<void>

export const processEvent =
  (
    persistEvent: ES.Event.FnPersistEvent,
    publishEvent: MB.FnPublishMsg,
    markEventAsSent: ES.Event.FnMarkEventAsSent
  ): FnProcessEvent =>
  async (event: ES.Event.AnyEvent) => {
    await persistEvent(event)
    await publishEvent(event.tag, event)
    await markEventAsSent(event)
  }
