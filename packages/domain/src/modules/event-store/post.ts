import { ES } from '..'
import { BusinessRuleError, TaggedType } from '../common'

export type Aggregate = {
  readonly aggregate: ES.Aggregate.Data
  readonly userId: string
  readonly description: string
}

export const create = (description: string, userId: string): [Aggregate, CreatedEvent] => {
  const aggregateData = ES.Aggregate.create()
  return [
    {
      aggregate: aggregateData,
      description,
      userId,
    },
    {
      data: ES.Event.create(aggregateData, aggregateData.createdAt),
      payload: {
        tag: 'post-created',
        description,
        userId,
      },
    },
  ]
}

// events
export type Event = CreatedEvent

export type CreatedEventPayload = TaggedType<'post-created'> & {
  readonly userId: string
  readonly description: string
}
export type CreatedEvent = {
  readonly data: ES.Event.Data
  readonly payload: CreatedEventPayload
}

// validation
export const validateDescription = (requestId: string, description: string) => {
  if (description.length > descriptionMaxLength) throw errors.descriptionLongerThanMaxLength(requestId)
  if (description.length === 0) throw errors.descriptionCannotBeEmpty(requestId)
}

export const errors = {
  descriptionLongerThanMaxLength: (requestId: string) =>
    new BusinessRuleError(requestId, `description cannot be longer than ${descriptionMaxLength} characters`),
  descriptionCannotBeEmpty: (requestId: string) => new BusinessRuleError(requestId, 'description cannot be empty'),
}

export const descriptionMaxLength = 500
