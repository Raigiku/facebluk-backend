import { BusinessRuleError, ES, INT, UA, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies): Promise<Response> => {
  validateInputFields(req.id, req.userId, req.toUserId)

  const toUser = await deps.getUserById(req.toUserId)
  if (toUser === undefined) throw errors.toUserDoesNotExist(req.id)

  const userRelationship = await deps.getUserRelationship(req.userId, req.toUserId)
  if (userRelationship?.blockedStatus.tag === 'blocked') {
    if (userRelationship.blockedStatus.fromUserId === req.userId)
      throw new BusinessRuleError(req.id, 'you have blocked this user')

    if (userRelationship.blockedStatus.fromUserId === req.toUserId)
      throw new BusinessRuleError(req.id, 'the other user has blocked you')
  }

  if (userRelationship?.friendStatus.tag === 'friended')
    throw errors.theUsersAreAlreadyFriends(req.id)

  const lastFriendRequest = await deps.getLastFriendRequestBetweenUsers(req.userId, req.toUserId)
  if (lastFriendRequest?.status.tag === 'pending') throw errors.alreadyPendingFriendRequest(req.id)

  const [, createdFriendRequestEvent] = ES.FriendRequest.create(req.userId, req.toUserId)

  await deps.processEvent(req.id, createdFriendRequestEvent)

  return { friendRequestId: createdFriendRequestEvent.data.aggregateId }
}

const validateInputFields = (requestId: string, userId: string, toUserId: string) => {
  Uuid.validate(requestId, userId, 'userId')
  Uuid.validate(requestId, toUserId, 'toUserId')
  if (userId === toUserId) throw errors.fromUserCannotBeToUser(requestId)
}

export type Dependencies = {
  readonly getUserRelationship: ES.UserRelationship.FnGetBetweenUsers
  readonly getUserById: UA.User.FnGetById
  readonly getLastFriendRequestBetweenUsers: ES.FriendRequest.FnGetLastBetweenUsers
  readonly processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly toUserId: string
}

export type Response = {
  readonly friendRequestId: string
}

export const errors = {
  toUserDoesNotExist: (requestId: string) =>
    new BusinessRuleError(requestId, 'the to user does not exist'),
  alreadyPendingFriendRequest: (requestId: string) =>
    new BusinessRuleError(requestId, 'there is an already pending friend request'),
  theUsersAreAlreadyFriends: (requestId: string) =>
    new BusinessRuleError(requestId, 'the users already are friends'),
  fromUserCannotBeToUser: (requestId: string) =>
    new BusinessRuleError(requestId, 'toUserId cannot be fromUserId'),
}
