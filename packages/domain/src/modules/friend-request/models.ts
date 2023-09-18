import { Event } from '..'
import { AggregateData, TaggedType } from '../common'
import { AcceptedEvent, CancelledEvent, RejectedEvent, SentEvent } from './events'

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

export const create = (fromUserId: string, toUserId: string): SentEvent => {
  const aggregateData = AggregateData.create()
  return {
    data: Event.create(aggregateData, aggregateData.createdAt),
    payload: {
      tag: 'friend-request-sent',
      fromUserId,
      toUserId,
    },
  }
}
export const accept = (friendRequest: Aggregate<PendingStatus>): AcceptedEvent => {
  return {
    data: Event.create(AggregateData.increaseVersion(friendRequest.aggregate), new Date()),
    payload: {
      tag: 'friend-request-accepted',
    },
  }
}
export const cancel = (friendRequest: Aggregate<PendingStatus>): CancelledEvent => {
  return {
    data: Event.create(AggregateData.increaseVersion(friendRequest.aggregate), new Date()),
    payload: {
      tag: 'friend-request-cancelled',
    },
  }
}
export const reject = (friendRequest: Aggregate<PendingStatus>): RejectedEvent => {
  return {
    data: Event.create(AggregateData.increaseVersion(friendRequest.aggregate), new Date()),
    payload: {
      tag: 'friend-request-rejected',
    },
  }
}
