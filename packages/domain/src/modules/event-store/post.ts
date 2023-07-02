import Joi from 'joi'
import { ES } from '..'
import { TaggedType } from '../common'

export type Aggregate = {
  readonly aggregate: ES.Aggregate.Data
  readonly userId: string
  readonly description: string
  readonly taggedUserIds: string[]
}

export const create = (
  description: string,
  userId: string,
  taggedUserIds: string[]
): [Aggregate, CreatedEvent] => {
  const aggregateData = ES.Aggregate.create()
  return [
    {
      aggregate: aggregateData,
      description,
      userId,
      taggedUserIds,
    },
    {
      data: ES.Event.create(aggregateData, aggregateData.createdAt),
      payload: {
        tag: 'post-created',
        description,
        userId,
        taggedUserIds
      },
    },
  ]
}

// events
export type Event = CreatedEvent

export type CreatedEventPayload = TaggedType<'post-created'> & {
  readonly userId: string
  readonly description: string
  readonly taggedUserIds: string[]
}
export type CreatedEvent = {
  readonly data: ES.Event.Data
  readonly payload: CreatedEventPayload
}

// validation
export const maxTaggedUserIds = 20
export const taggedUserIdsValidator = Joi.array().items(Joi.string()).max(20).unique()

export const descriptionMaxLength = 500
export const descriptionValidator = Joi.string().max(descriptionMaxLength)

// accessors
export type FnCreate = (event: CreatedEvent) => Promise<void>
