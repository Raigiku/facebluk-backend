import { BusinessRuleError, ES, INT, UA } from '../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  ES.Post.validateInputFields(req.id, req.description, req.userId)

  const user = await deps.getUserById(req.userId)
  if (user === undefined) throw new BusinessRuleError(req.id, 'the user does not exist')

  const [, createdPostEvent] = ES.Post.newA(req.description, req.userId)

  await deps.processEvent(createdPostEvent)
}

export type Dependencies = {
  readonly getUserById: UA.User.FnGetById
  readonly processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  id: string
  userId: string
  description: string
}
