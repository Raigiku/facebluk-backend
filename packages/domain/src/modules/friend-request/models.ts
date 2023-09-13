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

export const create = (
  fromUserId: string,
  toUserId: string
): [Aggregate<PendingStatus>, SentEvent] => {
  const aggregateData = AggregateData.create()
  return [
    {
      aggregate: aggregateData,
      fromUserId,
      toUserId,
      status: { tag: 'pending' },
    },
    {
      data: Event.create(aggregateData, aggregateData.createdAt),
      payload: {
        tag: 'friend-request-sent',
        fromUserId,
        toUserId,
      },
    },
  ]
}
export const accept = (
  friendRequest: Aggregate<PendingStatus>
): [Aggregate<AcceptedStatus>, AcceptedEvent] => {
  const acceptedAt = new Date()
  const updatedVersionAggregate = AggregateData.increaseVersion(friendRequest.aggregate)
  return [
    {
      ...friendRequest,
      aggregate: updatedVersionAggregate,
      status: { tag: 'accepted', acceptedAt },
    },
    {
      data: Event.create(updatedVersionAggregate, acceptedAt),
      payload: {
        tag: 'friend-request-accepted',
      },
    },
  ]
}
export const cancel = (
  friendRequest: Aggregate<PendingStatus>
): [Aggregate<CancelledStatus>, CancelledEvent] => {
  const cancelledAt = new Date()
  const updatedVersionAggregate = AggregateData.increaseVersion(friendRequest.aggregate)
  return [
    {
      ...friendRequest,
      aggregate: updatedVersionAggregate,
      status: { tag: 'cancelled', cancelledAt },
    },
    {
      data: Event.create(updatedVersionAggregate, cancelledAt),
      payload: {
        tag: 'friend-request-cancelled',
      },
    },
  ]
}
export const reject = (
  friendRequest: Aggregate<PendingStatus>
): [Aggregate<RejectedStatus>, RejectedEvent] => {
  const rejectedAt = new Date()
  const updatedVersionAggregate = AggregateData.increaseVersion(friendRequest.aggregate)
  return [
    {
      ...friendRequest,
      aggregate: updatedVersionAggregate,
      status: { tag: 'rejected', rejectedAt },
    },
    {
      data: Event.create(updatedVersionAggregate, rejectedAt),
      payload: {
        tag: 'friend-request-rejected',
      },
    },
  ]
}
