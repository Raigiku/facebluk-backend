import { ES } from '..'
import { BusinessRuleError, TaggedType, Uuid } from '../common'

export type DefaultAggregate = {
  readonly data: ES.Aggregate.Data
  readonly userId: string
  readonly description: string
}

export const newA = (description: string, userId: string): [DefaultAggregate, CreatedEvent] => {
  const aggregateData = ES.Aggregate.newA()
  return [
    {
      data: aggregateData,
      description,
      userId,
    },
    {
      data: ES.Event.newA(aggregateData),
      payload: {
        tag: POST_CREATED,
        description,
        userId,
      },
    },
  ]
}

// events
export type Event = CreatedEvent

export const POST_CREATED = 'post-created'
export type CreatedEventPayload = TaggedType<typeof POST_CREATED> & {
  readonly userId: string
  readonly description: string
}
export type CreatedEvent = {
  readonly data: ES.Event.Data
  readonly payload: CreatedEventPayload
}

// validation
export const validateInputFields = (requestId: string, description: string, userId: string) => {
  validateDescription(requestId, description)
  Uuid.validate(requestId, userId, 'userId')
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
