import { BusinessRuleError, ES, TaggedType } from '..'

export type Aggregate = {
  readonly aggregate: ES.Aggregate.Data
  readonly name: string
  readonly profileImageUrl?: string
}

export const create = (
  userId: string,
  name: string,
  imageUrl?: string
): [Aggregate, RegisteredUserEvent] => {
  const aggregateData = ES.Aggregate.createWithId(userId)
  return [
    {
      aggregate: aggregateData,
      name,
      profileImageUrl: imageUrl,
    },
    {
      data: ES.Event.create(aggregateData, new Date()),
      payload: {
        tag: 'user-registered',
        name,
        imageUrl,
      },
    },
  ]
}

// events
export type Event = RegisteredUserEvent

export const REGISTERED_USER_EVENT_TAG = 'user-registered'
export type RegisteredUserEventPayload = TaggedType<typeof REGISTERED_USER_EVENT_TAG> & {
  readonly name: string
  readonly imageUrl?: string
}
export type RegisteredUserEvent = {
  readonly data: ES.Event.Data
  readonly payload: RegisteredUserEventPayload
}

// validation
export const validateName = (requestId: string, name: string) => {
  if (name.length > NAME_MAX_LENGTH)
    new BusinessRuleError(requestId, `name cannot be longer than ${NAME_MAX_LENGTH} characters`)
  if (name.length === 0) throw new BusinessRuleError(requestId, 'name cannot be empty')
}

export const NAME_MAX_LENGTH = 100

// accessors
export type FnGetRegisteredUserEvent = (id: string) => Promise<RegisteredUserEvent | undefined>
