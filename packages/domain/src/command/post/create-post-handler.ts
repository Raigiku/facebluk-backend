import Joi from 'joi'
import { EventData, Post, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies): Promise<Response> => {
  await validator.validateAsync(req)

  const [, createdPostEvent] = Post.create(req.description, req.userId, req.taggedUserIds)

  await deps.createPost(createdPostEvent)
  await deps.publishEvent(req.id, createdPostEvent)

  return { postId: createdPostEvent.data.aggregateId }
}

export type Dependencies = {
  createPost: Post.FnCreate
  publishEvent: EventData.FnPublishEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly description: string
  readonly taggedUserIds: string[]
}

export const validator = Joi.object<Request, true>({
  id: Uuid.validator.required(),
  userId: Uuid.validator.required(),
  description: Post.descriptionValidator.required(),
  taggedUserIds: Post.taggedUserIdsValidator.required(),
})

export type Response = {
  readonly postId: string
}
