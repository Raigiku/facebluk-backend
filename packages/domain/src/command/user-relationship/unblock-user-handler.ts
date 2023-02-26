import { BusinessRuleError, ES, INT, UA, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  const fromUser = await deps.getUserById(req.fromUserId)
  if (fromUser === undefined) throw new BusinessRuleError(req.id, 'the from user does not exist')

  const toUser = await deps.getUserById(req.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(req.id, 'the to user does not exist')

  const [, unblockedEvent] = ES.UserRelationship.unblock(req.fromUserId, req.toUserId)

  await deps.processEvent(unblockedEvent)
}

const validateInputFields = (req: Request) => {
  Uuid.validate(req.id, req.fromUserId, 'fromUserId')
  Uuid.validate(req.id, req.toUserId, 'toUserId')
}

export type Dependencies = {
  readonly getUserById: UA.User.FnGetById
  readonly processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  id: string
  fromUserId: string
  toUserId: string
}
