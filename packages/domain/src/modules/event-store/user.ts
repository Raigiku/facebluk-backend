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

export const registeredUserEventTag = 'user-registered'
export type RegisteredUserEventPayload = TaggedType<typeof registeredUserEventTag> & {
  readonly name: string
  readonly imageUrl?: string
}
export type RegisteredUserEvent = {
  readonly data: ES.Event.Data
  readonly payload: RegisteredUserEventPayload
}

// validation
export const validateName = (requestId: string, name: string) => {
  if (name.length > nameMaxLength)
    new BusinessRuleError(requestId, `name cannot be longer than ${nameMaxLength} characters`)
  if (name.length === 0) throw new BusinessRuleError(requestId, 'name cannot be empty')
}

export const nameMaxLength = 100

// accessors
export type FnGetRegisteredUserEvent = (id: string) => Promise<RegisteredUserEvent | undefined>
