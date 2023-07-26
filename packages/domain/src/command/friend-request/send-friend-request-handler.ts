import Joi from 'joi'
import { BusinessRuleError, ES, INT, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies): Promise<Response> => {
  await validator.validateAsync(req)

  const toUser = await deps.es_findUserById(req.toUserId)
  if (toUser === undefined) throw errors.toUserDoesNotExist(req.id)

  const userRelationship = await deps.es_findUserRelationship(req.userId, req.toUserId)
  if (userRelationship !== undefined) {
    if (ES.UserRelationship.isBlocked(userRelationship)) {
      if (userRelationship.blockedStatus.fromUserId === req.userId)
        throw new BusinessRuleError(req.id, 'you have blocked this user')

      if (userRelationship.blockedStatus.fromUserId === req.toUserId)
        throw new BusinessRuleError(req.id, 'the other user has blocked you')
    }

    if (ES.UserRelationship.isFriend(userRelationship))
      throw errors.theUsersAreAlreadyFriends(req.id)
  }

  const lastFriendRequest = await deps.es_findLastFriendRequestBetweenUsers(
    req.userId,
    req.toUserId
  )
  if (lastFriendRequest !== undefined && ES.FriendRequest.isPending(lastFriendRequest))
    throw errors.alreadyPendingFriendRequest(req.id)

  const [, sentEvent] = ES.FriendRequest.create(req.userId, req.toUserId)

  await deps.es_sendFriendRequest(sentEvent)
  await deps.int_processEvent(req.id, sentEvent)

  return { friendRequestId: sentEvent.data.aggregateId }
}

export type Dependencies = {
  es_findUserRelationship: ES.UserRelationship.FnFindOneBetweenUsers
  es_findLastFriendRequestBetweenUsers: ES.FriendRequest.FnFindOneLastBetweenUsers
  es_sendFriendRequest: ES.FriendRequest.FnSend
  es_findUserById: ES.User.FnFindOneById

  int_processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly toUserId: string
}

export const validator = Joi.object<Request, true>({
  id: Uuid.validator.required(),
  userId: Uuid.validator.required(),
  toUserId: Uuid.validator.disallow(Joi.ref('userId')).required().messages({
    'any.invalid': '"toUserId" cannot be equal to "userId"',
  }),
})

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
