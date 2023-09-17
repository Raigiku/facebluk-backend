import Joi from 'joi'
import {
  BusinessRuleError,
  Event,
  FriendRequest,
  User,
  UserRelationship,
  Uuid,
} from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  const sentEvent = FriendRequest.create(req.fromUserId, req.toUserId)
  await deps.sendFriendRequest(sentEvent)
  await deps.publishEvent(req.requestId, sentEvent)
}

export type Dependencies = {
  sendFriendRequest: FriendRequest.FnSend
  publishEvent: Event.FnPublishEvent
}

export type Request = {
  readonly requestId: string
  readonly fromUserId: string
  readonly toUserId: string
}

export const id = 'send-friend-request'

export const validate = async (requestId: string, payload: ValidatePayload, deps: ValidateDeps) => {
  await syntaxValidator.validateAsync(payload)

  const toUser = await deps.findUserById(payload.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(requestId, 'the other user does not exist')

  const userRelationship = await deps.findUserRelationship(payload.fromUserId, payload.toUserId)
  if (userRelationship !== undefined) {
    if (UserRelationship.isBlocked(userRelationship)) {
      if (userRelationship.blockedStatus.fromUserId === payload.fromUserId)
        throw new BusinessRuleError(requestId, 'you have blocked this user')

      if (userRelationship.blockedStatus.fromUserId === payload.toUserId)
        throw new BusinessRuleError(requestId, 'the other user has blocked you')
    }

    if (UserRelationship.isFriend(userRelationship))
      throw new BusinessRuleError(requestId, 'the users already are friends')
  }

  const lastFriendRequest = await deps.findLastFriendRequestBetweenUsers(
    payload.fromUserId,
    payload.toUserId
  )
  if (lastFriendRequest !== undefined && FriendRequest.isPending(lastFriendRequest))
    throw new BusinessRuleError(requestId, 'there is an already pending friend request')
}

type ValidatePayload = {
  readonly fromUserId: string
  readonly toUserId: string
}

type ValidateDeps = {
  findUserRelationship: UserRelationship.FnFindOneBetweenUsers
  findUserById: User.FnFindOneById
  findLastFriendRequestBetweenUsers: FriendRequest.FnFindOneLastBetweenUsers
}

const syntaxValidator = Joi.object({
  fromUserId: Uuid.validator.required(),
  toUserId: Uuid.validator.disallow(Joi.ref('userId')).required().messages({
    'any.invalid': 'you cannot send yourself a friend request',
  }),
})
