import { ES } from '..'
import { BusinessRuleError, TaggedType, Uuid } from '../common'

export type Aggregate = {
  readonly data: ES.Aggregate.Data
  readonly userId: string
  readonly description: string
}

export const newA = (requestId: string, description: string, userId: string): [Aggregate, CreatedEvent] => {
  const aggregateData = ES.Aggregate.newA(requestId, ES.Aggregate.validate)
  return [
    validate(requestId, {
      data: aggregateData,
      description,
      userId,
    }),
    {
      tag: POST_CREATED,
      data: ES.Event.newA(aggregateData),
      description,
      userId,
    },
  ]
}

// events
export type Event = CreatedEvent

export const POST_CREATED = 'post-created'

export type CreatedEvent = TaggedType<typeof POST_CREATED> & {
  readonly data: ES.Event.Data
  readonly userId: string
  readonly description: string
}

// validation
export type FnValidate = (requestId: string, aggregate: Aggregate) => Aggregate

export const validate = (requestId: string, aggregate: Aggregate): Aggregate => {
  validateDescription(requestId, aggregate.description)
  Uuid.validate(requestId, aggregate.userId)
  return aggregate
}

export const validateDescription = (requestId: string, description: string) => {
  if (description.length > DESCRIPTION_MAX_LENGTH) throw descriptionLongerThanMaxLengthError(requestId)
  if (description.length === 0) throw descriptionCannotBeEmptyError(requestId)
}

export const descriptionLongerThanMaxLengthError = (requestId: string) =>
  new BusinessRuleError(requestId, `description cannot be longer than ${DESCRIPTION_MAX_LENGTH} characters`)

export const descriptionCannotBeEmptyError = (requestId: string) =>
  new BusinessRuleError(requestId, 'description cannot be empty')

export const DESCRIPTION_MAX_LENGTH = 500
