import { BusinessRuleError, ES, INT, UA } from '../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  const user = await deps.getUserById(req.userId)
  if (user === undefined) throw new BusinessRuleError(req.requestId, 'the user does not exist')

  const [, createdEvent] = ES.Post.newA(req.requestId, req.description, req.userId)

  await deps.processEvent(createdEvent)
}

export type Dependencies = {
  readonly getUserById: UA.User.FnGetById
  readonly processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  requestId: string
  userId: string
  description: string
}
