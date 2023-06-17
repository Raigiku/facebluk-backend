import { ES, INT, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies): Promise<Response> => {
  validateInputFields(req)

  const [newPost, createdPostEvent] = ES.Post.create(req.description, req.userId)

  await deps.es_registerPost(newPost, createdPostEvent)
  await deps.int_processEvent(req.id, createdPostEvent)

  return { postId: newPost.aggregate.id }
}

const validateInputFields = (req: Request) => {
  ES.Post.validateDescription(req.id, req.description)
  Uuid.validate(req.id, req.userId, 'userId')
}

export type Dependencies = {
  es_registerPost: ES.Post.FnRegister

  int_processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly description: string
}

export type Response = {
  readonly postId: string
}
