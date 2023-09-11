import Joi from 'joi'
import {
  BusinessRuleError,
  EventData,
  FriendRequest,
  User,
  UserRelationship,
  Uuid,
} from '../../modules'

export const handle = async (req: Request, deps: Dependencies): Promise<Response> => {
  await validator.validateAsync(req)

  const toUser = await deps.findUserById(req.toUserId)
  if (toUser === undefined) throw errors.toUserDoesNotExist(req.id)

  const userRelationship = await deps.findUserRelationship(req.userId, req.toUserId)
  if (userRelationship !== undefined) {
    if (UserRelationship.isBlocked(userRelationship)) {
      if (userRelationship.blockedStatus.fromUserId === req.userId)
        throw new BusinessRuleError(req.id, 'you have blocked this user')

      if (userRelationship.blockedStatus.fromUserId === req.toUserId)
        throw new BusinessRuleError(req.id, 'the other user has blocked you')
    }

    if (UserRelationship.isFriend(userRelationship)) throw errors.theUsersAreAlreadyFriends(req.id)
  }

  const lastFriendRequest = await deps.findLastFriendRequestBetweenUsers(req.userId, req.toUserId)
  if (lastFriendRequest !== undefined && FriendRequest.isPending(lastFriendRequest))
    throw errors.alreadyPendingFriendRequest(req.id)

  const [, sentEvent] = FriendRequest.create(req.userId, req.toUserId)

  await deps.sendFriendRequest(sentEvent)
  await deps.publishEvent(req.id, sentEvent)

  return { friendRequestId: sentEvent.data.aggregateId }
}

export type Dependencies = {
  findUserRelationship: UserRelationship.FnFindOneBetweenUsers
  findLastFriendRequestBetweenUsers: FriendRequest.FnFindOneLastBetweenUsers
  sendFriendRequest: FriendRequest.FnSend
  findUserById: User.FnFindOneById
  publishEvent: EventData.FnPublishEvent
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
