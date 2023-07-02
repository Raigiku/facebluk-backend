import Joi from 'joi'
import { ES, TaggedType } from '..'

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
  alias = alias.toLowerCase()
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
export type Event = RegisteredEvent | InfoUpdatedEvent

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
export const nameValidator = Joi.string().max(nameMaxLength)

export const aliasMaxLength = 20
export const aliasValidator = Joi.string().max(aliasMaxLength).alphanum()

// accessors
export type FnFindOneById = (userId: string) => Promise<Aggregate | undefined>
export type FnAliasExists = (alias: string) => Promise<boolean>
export type FnRegister = (event: RegisteredEvent) => Promise<void>
export type FnUpdateInfo = (event: InfoUpdatedEvent) => Promise<void>
