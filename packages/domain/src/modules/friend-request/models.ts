import { AggregateData, TaggedType } from '../common'

export type Aggregate<T extends AggregateStatus> = {
  readonly aggregate: AggregateData
  readonly fromUserId: string
  readonly toUserId: string
  readonly status: T
}

export type AggregateStatus = PendingStatus | AcceptedStatus | CancelledStatus | RejectedStatus

export type PendingStatus = TaggedType<'pending'>
export const isPending = (
  friendRequest: Aggregate<AggregateStatus>
): friendRequest is Aggregate<PendingStatus> => friendRequest.status.tag === 'pending'

export type AcceptedStatus = TaggedType<'accepted'> & {
  readonly acceptedAt: Date
}
export const isAccepted = (
  friendRequest: Aggregate<AggregateStatus>
): friendRequest is Aggregate<AcceptedStatus> => friendRequest.status.tag === 'accepted'

export type CancelledStatus = TaggedType<'cancelled'> & {
  readonly cancelledAt: Date
}
export const isCancelled = (
  friendRequest: Aggregate<AggregateStatus>
): friendRequest is Aggregate<CancelledStatus> => friendRequest.status.tag === 'cancelled'

export type RejectedStatus = TaggedType<'rejected'> & {
  readonly rejectedAt: Date
}
export const isRejected = (
  friendRequest: Aggregate<AggregateStatus>
): friendRequest is Aggregate<RejectedStatus> => friendRequest.status.tag === 'rejected'
