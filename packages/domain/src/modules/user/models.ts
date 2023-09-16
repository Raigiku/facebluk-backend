import Joi from 'joi'
import { Event } from '..'
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
): RegisteredEvent => {
  const aggregateData = AggregateData.createWithId(userId)
  alias = alias.toLowerCase()
  return {
    data: Event.create(aggregateData, new Date()),
    payload: {
      tag: 'user-registered',
      name,
      profilePictureUrl,
      alias,
    },
  }
}

export const updateInfo = (
  user: Aggregate,
  name?: string,
  profilePictureUrl?: string
): InfoUpdatedEvent => {
  return {
    data: Event.create(AggregateData.increaseVersion(user.aggregate), new Date()),
    payload: {
      tag: 'user-info-updated',
      name,
      profilePictureUrl,
    },
  }
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
