import { BusinessRuleError, ES, TaggedType } from '..'

export type Aggregate = {
  readonly aggregate: ES.Aggregate.Data
  readonly name: string
  readonly alias: string
  readonly profilePictureUrl?: string
}

export const create = (
  userId: string,
  name: string,
  alias: string,
  profilePictureUrl?: string
): [Aggregate, RegisteredEvent] => {
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

export const updateInfo = (
  user: Aggregate,
  name?: string,
  profilePictureUrl?: string
): [Aggregate, InfoUpdatedEvent] => {
  const aggregateData = ES.Aggregate.increaseVersion(user.aggregate)
  return [
    {
      ...user,
      aggregate: aggregateData,
      name: name ?? user.name,
      profilePictureUrl: profilePictureUrl ?? user.profilePictureUrl,
    },
    {
      data: ES.Event.create(aggregateData, new Date()),
      payload: {
        tag: 'user-info-updated',
        name,
        profilePictureUrl,
      },
    },
  ]
}

// events
export type Event = RegisteredEvent

export const registeredEventTag = 'user-registered'
export type RegisteredEventPayload = TaggedType<typeof registeredEventTag> & {
  readonly name: string
  readonly profilePictureUrl?: string
  readonly alias: string
}
export type RegisteredEvent = {
  readonly data: ES.Event.Data
  readonly payload: RegisteredEventPayload
}

export const updatedInfoEventTag = 'user-info-updated'
export type InfoUpdatedEventPayload = TaggedType<typeof updatedInfoEventTag> & {
  readonly name?: string
  readonly profilePictureUrl?: string
}
export type InfoUpdatedEvent = {
  readonly data: ES.Event.Data
  readonly payload: InfoUpdatedEventPayload
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
export type FnFindOneById = (userId: string) => Promise<Aggregate | undefined>
export type FnAliasExists = (alias: string) => Promise<boolean>
export type FnRegister = (event: RegisteredEvent) => Promise<void>
