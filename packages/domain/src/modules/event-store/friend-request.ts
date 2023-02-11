import { BusinessRuleError, ES, TaggedType, Uuid } from '..'

export type Aggregate = PendingAggregate | AcceptedAggregate | RejectedAggregate | CancelledAggregate
export type AggregateData = {
  readonly data: ES.Aggregate.Data
  readonly fromUserId: string
  readonly toUserId: string
}
export type PendingAggregate = AggregateData & TaggedType<'pending-aggregate'>

export type AcceptedAggregate = AggregateData & {
  readonly acceptedAt: Date
} & TaggedType<'accepted-aggregate'>

export type RejectedAggregate = AggregateData & {
  readonly rejectedAt: Date
} & TaggedType<'rejected-aggregate'>

export type CancelledAggregate = AggregateData & {
  readonly cancelledAt: Date
} & TaggedType<'cancelled-aggregate'>

export const newA = (fromUserId: string, toUserId: string): [PendingAggregate, SentEvent] => {
  const aggregateData = ES.Aggregate.newA()
  return [
    {
      tag: 'pending-aggregate',
      data: aggregateData,
      fromUserId,
      toUserId,
    },
    {
      data: ES.Event.newA(aggregateData),
      payload: {
        tag: 'friend-request-sent',
        fromUserId,
        toUserId,
      },
    },
  ]
}
export const accept = (friendRequest: PendingAggregate): [AcceptedAggregate, AcceptedEvent] => {
  const acceptedAt = new Date()
  const updatedVersionAggregate = ES.Aggregate.increaseVersion(friendRequest.data)
  return [
    {
      ...friendRequest,
      data: updatedVersionAggregate,
      tag: 'accepted-aggregate',
      acceptedAt,
    },
    {
      data: ES.Event.newA(updatedVersionAggregate),
      payload: {
        tag: 'friend-request-accepted',
      },
    },
  ]
}
export const cancel = (friendRequest: PendingAggregate): [CancelledAggregate, CancelledEvent] => {
  const cancelledAt = new Date()
  const updatedVersionAggregate = ES.Aggregate.increaseVersion(friendRequest.data)
  return [
    {
      ...friendRequest,
      data: updatedVersionAggregate,
      tag: 'cancelled-aggregate',
      cancelledAt,
    },
    {
      data: ES.Event.newA(updatedVersionAggregate),
      payload: {
        tag: 'friend-request-cancelled',
      },
    },
  ]
}
export const reject = (friendRequest: PendingAggregate): [RejectedAggregate, RejectedEvent] => {
  const rejectedAt = new Date()
  const updatedVersionAggregate = ES.Aggregate.increaseVersion(friendRequest.data)
  return [
    {
      ...friendRequest,
      data: updatedVersionAggregate,
      tag: 'rejected-aggregate',
      rejectedAt,
    },
    {
      data: ES.Event.newA(updatedVersionAggregate),
      payload: {
        tag: 'friend-request-rejected',
      },
    },
  ]
}

// events
export type Event = SentEvent | AcceptedEvent | CancelledEvent | RejectedEvent
export type EventPayload = Record<string, never>

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

// validation
export const validateInputFields = (requestId: string, fromUserId: string, toUserId: string) => {
  Uuid.validate(requestId, fromUserId, 'fromUserId')
  Uuid.validate(requestId, toUserId, 'toUserId')
  if (fromUserId === toUserId) throw fromUserCannotBeToUser(requestId)
}

export const fromUserCannotBeToUser = (requestId: string) =>
  new BusinessRuleError(requestId, 'toUserId cannot be fromUserId')

// accessors
export type FnGet = (id: string) => Promise<Aggregate | undefined>
export type FnGetLastBetweenUsers = (fromUserId: string, toUserId: string) => Promise<Aggregate | undefined>
