import Joi from 'joi'
import { Event } from '..'
import { AggregateData } from '../common'
import { CreatedEvent } from './events'

export type Aggregate = {
  readonly aggregate: AggregateData
  readonly userId: string
  readonly description: string
  readonly taggedUserIds: string[]
}

export const create = (
  id: string,
  description: string,
  userId: string,
  taggedUserIds: string[]
): CreatedEvent => {
  const aggregateData = AggregateData.createWithId(id)
  return {
    data: Event.create(aggregateData, aggregateData.createdAt),
    payload: {
      tag: 'post-created',
      description,
      userId,
      taggedUserIds,
    },
  }
}

// validation
export const maxTaggedUserIds = 20
export const taggedUserIdsValidator = Joi.array().items(Joi.string()).max(20).unique()

export const descriptionMaxLength = 500
export const descriptionValidator = Joi.string().max(descriptionMaxLength)
