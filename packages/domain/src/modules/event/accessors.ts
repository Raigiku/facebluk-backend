import { AnyEvent } from './models'

// mutations
export type FnPublishEvent = (requestId: string, event: AnyEvent) => Promise<void>
export type FnSendBrokerMsg = (
  requestId: string,
  exchange: string,
  body: object
) => Promise<void>
