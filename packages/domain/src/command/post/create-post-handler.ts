import Joi from 'joi'
import { Event, Post } from '../../modules'

export const handle = async (req: Request, deps: Dependencies): Promise<void> => {
  const createdPostEvent = Post.create(req.postId, req.description, req.userId, req.taggedUserIds)
  await deps.createPost(createdPostEvent)
  await deps.publishEvent(req.requestId, createdPostEvent)
}

export type Dependencies = {
  createPost: Post.FnCreate
  publishEvent: Event.FnPublishEvent
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

