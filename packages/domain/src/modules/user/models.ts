import Joi from 'joi'
import { AggregateData } from '../common'

export type Aggregate = {
  readonly aggregate: AggregateData
  readonly name: string
  readonly alias: string
  readonly profilePictureUrl?: string
}

export type AuthMetadata = {
  readonly userId: string
  readonly registeredAt?: Date
}

// validation
export const nameMaxLength = 100
export const nameValidator = Joi.string().max(nameMaxLength)

export const aliasMaxLength = 20
export const aliasValidator = Joi.string().max(aliasMaxLength).alphanum()
