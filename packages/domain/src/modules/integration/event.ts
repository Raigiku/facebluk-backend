import { ES, Logger, MB } from '..'

export type FnProcessEvent = (
  requestId: string,
  event: ES.Event.AnyEvent,
  callbackAfterPersist?: () => Promise<void>
) => Promise<void>

export type FnProcessEvents = (
  requestId: string,
  events: ES.Event.AnyEvent[],
  userId?: string,
  callbackAfterPersist?: () => Promise<void>
) => Promise<void>

export const processEvent =
  (
    persistEvent: ES.Event.FnPersistEvent,
    publishEvent: MB.FnPublishMsg,
    markEventAsSent: ES.Event.FnMarkEventAsSent
  ): FnProcessEvent =>
  async (
    requestId: string,
    event: ES.Event.AnyEvent,
    callbackAfterPersist?: () => Promise<void>
  ) => {
    await persistEvent(event)
    if (callbackAfterPersist !== undefined) await callbackAfterPersist()
    await publishEvent(requestId, event.payload.tag, event)
    await markEventAsSent(event)
  }

export const processEvents =
  (
    log: Logger.FnLog,
    persistEvents: ES.Event.FnPersistEvents,
    publishEvent: MB.FnPublishMsg,
    markEventAsSent: ES.Event.FnMarkEventAsSent
  ): FnProcessEvents =>
  async (
    requestId: string,
    events: ES.Event.AnyEvent[],
    userId?: string,
    callbackAfterPersist?: () => Promise<void>
  ) => {
    await persistEvents(events)
    if (callbackAfterPersist !== undefined) await callbackAfterPersist()
    for (const event of events) {
      try {
        await publishEvent(requestId, event.payload.tag, event)
        await markEventAsSent(event)
      } catch (error) {
        if (error instanceof Error)
          log('error', requestId, 'failed to process event', userId, error)
      }
    }
  }
