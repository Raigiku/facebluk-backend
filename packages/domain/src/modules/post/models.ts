import Joi from 'joi'
import { AggregateData } from '../common'

export type Aggregate = {
  readonly aggregate: AggregateData
  readonly userId: string
  readonly description: string
  readonly taggedUserIds: string[]
}

// validation
export const maxTaggedUserIds = 20
export const taggedUserIdsValidator = Joi.array().items(Joi.string()).max(20).unique()

export const descriptionMaxLength = 500
export const descriptionValidator = Joi.string().max(descriptionMaxLength)
