import Joi from 'joi'
import { ES, INT, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies): Promise<Response> => {
  validator.validate(req)

  const [, createdPostEvent] = ES.Post.create(req.description, req.userId, req.taggedUserIds)

  await deps.es_createPost(createdPostEvent)
  await deps.int_processEvent(req.id, createdPostEvent)

  return { postId: createdPostEvent.data.aggregateId }
}

export type Dependencies = {
  es_createPost: ES.Post.FnCreate

  int_processEvent: INT.Event.FnProcessEvent
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
  description: ES.Post.descriptionValidator.required(),
  taggedUserIds: ES.Post.taggedUserIdsValidator.required(),
})

export type Response = {
  readonly postId: string
}
