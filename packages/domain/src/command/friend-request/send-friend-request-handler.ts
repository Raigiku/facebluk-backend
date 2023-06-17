import { BusinessRuleError, ES, INT, UA, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies): Promise<Response> => {
  validateInputFields(req.id, req.userId, req.toUserId)

  const toUser = await deps.ua_findUserById(req.toUserId)
  if (toUser === undefined) throw errors.toUserDoesNotExist(req.id)

  const userRelationship = await deps.es_findUserRelationship(req.userId, req.toUserId)
  if (userRelationship?.blockedStatus.tag === 'blocked') {
    if (userRelationship.blockedStatus.fromUserId === req.userId)
      throw new BusinessRuleError(req.id, 'you have blocked this user')

    if (userRelationship.blockedStatus.fromUserId === req.toUserId)
      throw new BusinessRuleError(req.id, 'the other user has blocked you')
  }

  if (userRelationship?.friendStatus.tag === 'friended')
    throw errors.theUsersAreAlreadyFriends(req.id)

  const lastFriendRequest = await deps.es_findLastFriendRequestBetweenUsers(
    req.userId,
    req.toUserId
  )
  if (lastFriendRequest?.status.tag === 'pending') throw errors.alreadyPendingFriendRequest(req.id)

  const [friendRequest, sentEvent] = ES.FriendRequest.create(req.userId, req.toUserId)

  await deps.es_registerFriendRequest(friendRequest, sentEvent)
  await deps.int_processEvent(req.id, sentEvent)

  return { friendRequestId: friendRequest.aggregate.id }
}

const validateInputFields = (requestId: string, userId: string, toUserId: string) => {
  Uuid.validate(requestId, userId, 'userId')
  Uuid.validate(requestId, toUserId, 'toUserId')
  if (userId === toUserId) throw errors.fromUserCannotBeToUser(requestId)
}

export type Dependencies = {
  es_findUserRelationship: ES.UserRelationship.FnFindOneBetweenUsers
  es_findLastFriendRequestBetweenUsers: ES.FriendRequest.FnFindOneLastBetweenUsers
  es_registerFriendRequest: ES.FriendRequest.FnRegister

  ua_findUserById: UA.User.FnFindOneById

  int_processEvent: INT.Event.FnProcessEvent
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
