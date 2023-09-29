import Joi from 'joi'
import { Event, Post } from '../../modules'

export const handle = async (req: Request, deps: Dependencies): Promise<void> => {
  const postCreatedLookup = await deps.db_findPostCreatedEvent<Post.CreatedEvent>(req.requestId)

  const createdPostEvent =
    postCreatedLookup === undefined
      ? Post.CreatedEvent.create(
          req.requestId,
          req.postId,
          req.description,
          req.userId,
          req.taggedUserIds
        )
      : postCreatedLookup

  await deps.createPost(createdPostEvent, postCreatedLookup === undefined)

  await deps.publishEvent(createdPostEvent)
}

export type Dependencies = {
  db_findPostCreatedEvent: Event.DbQueries.FindEvent
  createPost: Post.Mutations.Create
  publishEvent: Event.Mutations.PublishEvent
}

export type Request = {
  readonly requestId: string
  readonly postId: string
  readonly userId: string
  readonly description: string
  readonly taggedUserIds: string[]
}

export const id = 'create-post'

export const validate = async (payload: ValidatePayload) => {
  await syntaxValidator.validateAsync(payload)
}

type ValidatePayload = {
  readonly description: string
  readonly taggedUserIds: string[]
}

const syntaxValidator = Joi.object({
  description: Post.descriptionValidator.required(),
  taggedUserIds: Post.taggedUserIdsValidator.required(),
})
