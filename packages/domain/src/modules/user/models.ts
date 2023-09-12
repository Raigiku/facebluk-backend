import Joi from 'joi'
import { EventData } from '..'
import { AggregateData } from '../common'
import { InfoUpdatedEvent, RegisteredEvent } from './events'

export type Aggregate = {
  readonly aggregate: AggregateData
  readonly name: string
  readonly alias: string
  readonly profilePictureUrl?: string
}

export const register = (
  userId: string,
  name: string,
  alias: string,
  profilePictureUrl?: string
): [Aggregate, RegisteredEvent] => {
  const aggregateData = AggregateData.createWithId(userId)
  alias = alias.toLowerCase()
  return [
    {
      aggregate: aggregateData,
      name,
      alias,
      profilePictureUrl,
    },
    {
      data: EventData.create(aggregateData, new Date()),
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
  const aggregateData = AggregateData.increaseVersion(user.aggregate)
  return [
    {
      ...user,
      aggregate: aggregateData,
      name: name ?? user.name,
      profilePictureUrl: profilePictureUrl ?? user.profilePictureUrl,
    },
    {
      data: EventData.create(aggregateData, new Date()),
      payload: {
        tag: 'user-info-updated',
        name,
        profilePictureUrl,
      },
    },
  ]
}

export type AuthMetadata = {
  readonly id: string
  readonly registeredAt?: Date
}

export const isRegistered = (authMetadata: AuthMetadata) => {
  return authMetadata.registeredAt !== undefined
}

// validation
export const nameMaxLength = 100
export const nameValidator = Joi.string().max(nameMaxLength)

export const aliasMaxLength = 20
export const aliasValidator = Joi.string().max(aliasMaxLength).alphanum()
