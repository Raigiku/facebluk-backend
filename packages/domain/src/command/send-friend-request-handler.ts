import { BusinessRuleError, ES, INT, UA } from '../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  ES.FriendRequest.validateInputFields(req.id, req.fromUserId, req.toUserId)

  const fromUser = await deps.getUserById(req.fromUserId)
  if (fromUser === undefined) throw new BusinessRuleError(req.id, 'the from user does not exist')

  const toUser = await deps.getUserById(req.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(req.id, 'the to user does not exist')

  const [, createdFriendRequestEvent] = ES.FriendRequest.newA(req.fromUserId, req.toUserId)

  await deps.processEvent(createdFriendRequestEvent)
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
