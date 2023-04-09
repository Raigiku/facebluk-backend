import { BusinessRuleError, ES, TaggedType } from '..'

export type Aggregate = {
  readonly aggregate: ES.Aggregate.Data
  readonly name: string
  readonly profilePictureUrl?: string
  readonly alias: string
}

export const create = (
  userId: string,
  name: string,
  alias: string,
  profilePictureUrl?: string
): [Aggregate, RegisteredUserEvent] => {
  const aggregateData = ES.Aggregate.createWithId(userId)
  return [
    {
      aggregate: aggregateData,
      name,
      alias,
      profilePictureUrl,
    },
    {
      data: ES.Event.create(aggregateData, new Date()),
      payload: {
        tag: 'user-registered',
        name,
        profilePictureUrl,
        alias,
      },
    },
  ]
}

// events
export type Event = RegisteredUserEvent

export const registeredUserEventTag = 'user-registered'
export type RegisteredUserEventPayload = TaggedType<typeof registeredUserEventTag> & {
  readonly name: string
  readonly profilePictureUrl?: string
  readonly alias: string
}
export type RegisteredUserEvent = {
  readonly data: ES.Event.Data
  readonly payload: RegisteredUserEventPayload
}

// validation
export const nameMaxLength = 100
export const validateName = (requestId: string, name: string) => {
  if (name.length > nameMaxLength)
    new BusinessRuleError(requestId, `name cannot be longer than ${nameMaxLength} characters`)
  if (name.length === 0) throw new BusinessRuleError(requestId, 'name cannot be empty')
}

export const aliasMaxLength = 20
export const validateAlias = (requestId: string, alias: string) => {
  if (alias.length > aliasMaxLength)
    new BusinessRuleError(requestId, `alias cannot be longer than ${aliasMaxLength} characters`)
  if (alias.length === 0) throw new BusinessRuleError(requestId, 'alias cannot be empty')
  const alphanumericRegex = /^[a-z0-9]+$/i
  if (!alphanumericRegex.test(alias))
    throw new BusinessRuleError(requestId, 'alias can only be alphanumeric')
}

// accessors
export type FnGetRegisteredUserEvent = (id: string) => Promise<RegisteredUserEvent | undefined>
