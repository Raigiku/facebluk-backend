import { BusinessRuleError, ES, INT, UA, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  const lastFriendRequest = await deps.getLastFriendRequestBetweenUsers(req.fromUserId, req.toUserId)
  if (lastFriendRequest?.tag !== 'accepted-aggregate') throw new BusinessRuleError(req.id, 'the users are not friends')

  const userRelationship = await deps.getUserRelationship(req.fromUserId, req.toUserId)
  if (userRelationship?.tag === 'block-aggregate') {
    if (userRelationship.fromUserId === req.fromUserId)
      throw new BusinessRuleError(req.id, 'the other user has blocked you')
    if (userRelationship.toUserId === req.fromUserId) throw new BusinessRuleError(req.id, 'you have blocked this user')
  }

  const fromUser = await deps.getUserById(req.fromUserId)
  if (fromUser === undefined) throw new BusinessRuleError(req.id, 'the from user does not exist')

  const toUser = await deps.getUserById(req.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(req.id, 'the to user does not exist')

  const [, unfriendedEvent] = ES.UserRelationship.unfriend(req.fromUserId, req.toUserId)

  await deps.processEvent(req.id, req.fromUserId, unfriendedEvent)
}

const validateInputFields = (req: Request) => {
  Uuid.validate(req.id, req.fromUserId, 'fromUserId')
  Uuid.validate(req.id, req.toUserId, 'toUserId')
}

export type Dependencies = {
  readonly getUserRelationship: ES.UserRelationship.FnGetBetweenUsers
  readonly getLastFriendRequestBetweenUsers: ES.FriendRequest.FnGetLastBetweenUsers
  readonly getUserById: UA.User.FnGetById
  readonly processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  id: string
  fromUserId: string
  toUserId: string
}
