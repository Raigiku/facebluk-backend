import { ES, INT, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies): Promise<Response> => {
  validateInputFields(req)

  const [, createdPostEvent] = ES.Post.create(req.description, req.userId)

  await deps.processEvent(req.id, createdPostEvent)

  return { postId: createdPostEvent.data.aggregateId }
}

const validateInputFields = (req: Request) => {
  ES.Post.validateDescription(req.id, req.description)
  Uuid.validate(req.id, req.userId, 'userId')
}

export type Dependencies = {
  readonly processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly description: string
}

export type Response = {
  readonly postId: string
}
