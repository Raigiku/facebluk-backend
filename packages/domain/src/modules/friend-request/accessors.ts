import { AcceptedEvent, CancelledEvent, RejectedEvent, SentEvent } from './events'
import { Aggregate, AggregateStatus } from './models'

// mutations
export type FnSend = (event: SentEvent) => Promise<void>
export type FnCancel = (event: CancelledEvent) => Promise<void>
export type FnReject = (event: RejectedEvent) => Promise<void>
export type FnAccept = (event: AcceptedEvent) => Promise<void>
// queries
export type FnFindOneById = (id: string) => Promise<Aggregate<AggregateStatus> | undefined>
export type FnFindOneLastBetweenUsers = (
  userAId: string,
  userBId: string
) => Promise<Aggregate<AggregateStatus> | undefined>
