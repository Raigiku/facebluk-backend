import { ES, Logger, MB } from '..'

export type FnProcessEvent = (
  requestId: string,
  event: ES.Event.AnyEvent,
) => Promise<void>

export type FnProcessEvents = (
  requestId: string,
  events: ES.Event.AnyEvent[],
  userId?: string,
) => Promise<void>

export const processEvent =
  (
    publishEvent: MB.FnPublishMsg,
    markEventAsSent: ES.Event.FnMarkEventAsSent
  ): FnProcessEvent =>
  async (
    requestId: string,
    event: ES.Event.AnyEvent,
  ) => {
    await publishEvent(requestId, event.payload.tag, event)
    await markEventAsSent(event)
  }

export const processEvents =
  (
    log: Logger.FnLog,
    publishEvent: MB.FnPublishMsg,
    markEventAsSent: ES.Event.FnMarkEventAsSent
  ): FnProcessEvents =>
  async (
    requestId: string,
    events: ES.Event.AnyEvent[],
    userId?: string,
  ) => {
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
