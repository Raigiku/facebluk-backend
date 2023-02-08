import { BusinessRuleError, ES, TaggedType, Uuid } from '..'

export type Aggregate = DefaultAggregate | AcceptedAggregate | RejectedAggregate | CancelledAggregate
export type DefaultAggregate = {
  readonly data: ES.Aggregate.Data
  readonly fromUserId: string
  readonly toUserId: string
}
export type AcceptedAggregate = DefaultAggregate & {
  readonly acceptedAt: Date
}
export type RejectedAggregate = DefaultAggregate & {
  readonly rejectedAt: Date
}
export type CancelledAggregate = DefaultAggregate & {
  readonly cancelledAt: Date
}

export const newA = (fromUserId: string, toUserId: string): [DefaultAggregate, SentEvent] => {
  const aggregateData = ES.Aggregate.newA()
  return [
    {
      data: aggregateData,
      fromUserId,
      toUserId,
    },
    {
      data: ES.Event.newA(aggregateData),
      payload: {
        tag: FRIEND_REQUEST_SENT,
        fromUserId,
        toUserId,
      },
    },
  ]
}
export const accept = (friendRequest: DefaultAggregate): [AcceptedAggregate, AcceptedEvent] => {
  const acceptedAt = new Date()
  return [
    {
      ...friendRequest,
      acceptedAt,
    },
    {
      data: ES.Event.newA(friendRequest.data),
      payload: {
        tag: FRIEND_REQUEST_ACCEPTED,
      },
    },
  ]
}
export const cancel = (friendRequest: DefaultAggregate): [CancelledAggregate, CancelledEvent] => {
  const cancelledAt = new Date()
  return [
    {
      ...friendRequest,
      cancelledAt,
    },
    {
      data: ES.Event.newA(friendRequest.data),
      payload: {
        tag: FRIEND_REQUEST_CANCELLED,
      },
    },
  ]
}
export const reject = (friendRequest: DefaultAggregate): [RejectedAggregate, RejectedEvent] => {
  const rejectedAt = new Date()
  return [
    {
      ...friendRequest,
      rejectedAt,
    },
    {
      data: ES.Event.newA(friendRequest.data),
      payload: {
        tag: FRIEND_REQUEST_REJECTED,
      },
    },
  ]
}

// events
export type Event = SentEvent | AcceptedEvent | CancelledEvent | RejectedEvent
export type EventPayload = Record<string, never>

export const FRIEND_REQUEST_REJECTED = 'friend-request-rejected'
export type RejectedEventPayload = TaggedType<typeof FRIEND_REQUEST_REJECTED>
export type RejectedEvent = {
  readonly data: ES.Event.Data
  readonly payload: RejectedEventPayload
}

export const FRIEND_REQUEST_CANCELLED = 'friend-request-cancelled'
export type CancelledEventPayload = TaggedType<typeof FRIEND_REQUEST_CANCELLED>
export type CancelledEvent = {
  readonly data: ES.Event.Data
  readonly payload: CancelledEventPayload
}

export const FRIEND_REQUEST_ACCEPTED = 'friend-request-accepted'
export type AcceptedEventPayload = TaggedType<typeof FRIEND_REQUEST_ACCEPTED>
export type AcceptedEvent = {
  readonly data: ES.Event.Data
  readonly payload: AcceptedEventPayload
}

export const FRIEND_REQUEST_SENT = 'friend-request-sent'
export type SentEventPayload = TaggedType<typeof FRIEND_REQUEST_SENT> & {
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
export type FnGet = (id: string) => Promise<DefaultAggregate | undefined>
