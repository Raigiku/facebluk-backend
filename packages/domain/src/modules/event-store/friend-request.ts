import { ES, TaggedType } from '..'

export type Aggregate<T extends AggregateStatus> = {
  readonly aggregate: ES.Aggregate.Data
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
  const aggregateData = ES.Aggregate.create()
  return [
    {
      aggregate: aggregateData,
      fromUserId,
      toUserId,
      status: { tag: 'pending' },
    },
    {
      data: ES.Event.create(aggregateData, aggregateData.createdAt),
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
  const updatedVersionAggregate = ES.Aggregate.increaseVersion(friendRequest.aggregate)
  return [
    {
      ...friendRequest,
      aggregate: updatedVersionAggregate,
      status: { tag: 'accepted', acceptedAt },
    },
    {
      data: ES.Event.create(updatedVersionAggregate, acceptedAt),
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
  const updatedVersionAggregate = ES.Aggregate.increaseVersion(friendRequest.aggregate)
  return [
    {
      ...friendRequest,
      aggregate: updatedVersionAggregate,
      status: { tag: 'cancelled', cancelledAt },
    },
    {
      data: ES.Event.create(updatedVersionAggregate, cancelledAt),
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
  const updatedVersionAggregate = ES.Aggregate.increaseVersion(friendRequest.aggregate)
  return [
    {
      ...friendRequest,
      aggregate: updatedVersionAggregate,
      status: { tag: 'rejected', rejectedAt },
    },
    {
      data: ES.Event.create(updatedVersionAggregate, rejectedAt),
      payload: {
        tag: 'friend-request-rejected',
      },
    },
  ]
}

// events
export type Event = SentEvent | AcceptedEvent | CancelledEvent | RejectedEvent

export type RejectedEventPayload = TaggedType<'friend-request-rejected'>
export type RejectedEvent = {
  readonly data: ES.Event.Data
  readonly payload: RejectedEventPayload
}

export type CancelledEventPayload = TaggedType<'friend-request-cancelled'>
export type CancelledEvent = {
  readonly data: ES.Event.Data
  readonly payload: CancelledEventPayload
}

export type AcceptedEventPayload = TaggedType<'friend-request-accepted'>
export type AcceptedEvent = {
  readonly data: ES.Event.Data
  readonly payload: AcceptedEventPayload
}

export type SentEventPayload = TaggedType<'friend-request-sent'> & {
  readonly fromUserId: string
  readonly toUserId: string
}
export type SentEvent = {
  readonly data: ES.Event.Data
  readonly payload: SentEventPayload
}

// accessors
export type FnFindOneById = (id: string) => Promise<Aggregate<AggregateStatus> | undefined>
export type FnSend = (event: SentEvent) => Promise<void>
export type FnCancel = (event: CancelledEvent) => Promise<void>
export type FnReject = (event: RejectedEvent) => Promise<void>
export type FnAccept = (event: AcceptedEvent) => Promise<void>
export type FnFindOneLastBetweenUsers = (
  userAId: string,
  userBId: string
) => Promise<Aggregate<AggregateStatus> | undefined>
