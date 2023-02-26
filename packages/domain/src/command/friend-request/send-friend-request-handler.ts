import { BusinessRuleError, ES, INT, UA } from '../../modules'

export const handle = async (req: Request, deps: Dependencies): Promise<Response> => {
  ES.FriendRequest.validateInputFields(req.id, req.fromUserId, req.toUserId)

  const userRelationship = await deps.getUserRelationship(req.fromUserId, req.toUserId)
  if (userRelationship?.tag === 'block-aggregate') {
    if (userRelationship.fromUserId === req.fromUserId)
      throw new BusinessRuleError(req.id, 'you have blocked this user')
    if (userRelationship.fromUserId === req.toUserId)
      throw new BusinessRuleError(req.id, 'the other user has blocked you')
  }

  const lastFriendRequest = await deps.getLastFriendRequestBetweenUsers(req.fromUserId, req.toUserId)
  if (lastFriendRequest !== undefined) {
    if (lastFriendRequest.tag === 'pending-aggregate') throw errors.alreadyPendingFriendRequest(req.id)
    if (lastFriendRequest.tag === 'accepted-aggregate' && userRelationship === undefined)
      throw errors.theUsersAreAlreadyFriends(req.id)
  }

  const fromUser = await deps.getUserById(req.fromUserId)
  if (fromUser === undefined) throw errors.fromUserDoesNotExist(req.id)

  const toUser = await deps.getUserById(req.toUserId)
  if (toUser === undefined) throw errors.toUserDoesNotExist(req.id)

  const [, createdFriendRequestEvent] = ES.FriendRequest.newA(req.fromUserId, req.toUserId)

  await deps.processEvent(createdFriendRequestEvent)

  return { friendRequestId: createdFriendRequestEvent.data.aggregateId }
}

export type Dependencies = {
  readonly getUserRelationship: ES.UserRelationship.FnGetBetweenUsers
  readonly getUserById: UA.User.FnGetById
  readonly getLastFriendRequestBetweenUsers: ES.FriendRequest.FnGetLastBetweenUsers
  readonly processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  id: string
  fromUserId: string
  toUserId: string
}

export type Response = {
  friendRequestId: string
}

export const errors = {
  fromUserDoesNotExist: (requestId: string) => new BusinessRuleError(requestId, 'the from user does not exist'),
  toUserDoesNotExist: (requestId: string) => new BusinessRuleError(requestId, 'the to user does not exist'),
  alreadyPendingFriendRequest: (requestId: string) =>
    new BusinessRuleError(requestId, 'there is an already pending friend request'),
  theUsersAreAlreadyFriends: (requestId: string) => new BusinessRuleError(requestId, 'the users already are friends'),
}
