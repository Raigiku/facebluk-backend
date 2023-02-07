import { BusinessRuleError, ES, TaggedType, Uuid } from '..'

export type Aggregate = {
  readonly data: ES.Aggregate.Data
  readonly fromUserId: string
  readonly toUserId: string
}

export const newA = (fromUserId: string, toUserId: string): [Aggregate, CreatedEvent] => {
  const aggregateData = ES.Aggregate.newA()
  return [
    {
      data: aggregateData,
      fromUserId,
      toUserId,
    },
    {
      tag: FRIEND_REQUEST_CREATED,
      data: ES.Event.newA(aggregateData),
      fromUserId,
      toUserId,
    },
  ]
}

// events
export type Event = CreatedEvent

export const FRIEND_REQUEST_CREATED = 'friend-request-created'

export type CreatedEvent = TaggedType<typeof FRIEND_REQUEST_CREATED> & {
  readonly data: ES.Event.Data
} & Omit<Aggregate, 'data'>

// validation
export const validateInputFields = (requestId: string, fromUserId: string, toUserId: string) => {
  Uuid.validate(requestId, fromUserId, 'fromUserId')
  Uuid.validate(requestId, toUserId, 'toUserId')
  if (fromUserId === toUserId) throw fromUserCannotBeToUser(requestId, fromUserId, toUserId)
}

export const fromUserCannotBeToUser = (requestId: string, fromUserId: string, toUserId: string) =>
  new BusinessRuleError(requestId, 'toUserId cannot be fromUserId')
