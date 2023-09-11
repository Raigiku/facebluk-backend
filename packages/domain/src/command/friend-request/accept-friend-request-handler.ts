import Joi from 'joi'
import { BusinessRuleError, EventData, FriendRequest, UserRelationship, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  await validator.validateAsync(req)

  const friendRequest = await deps.findFriendRequest(req.friendRequestId)
  if (friendRequest === undefined)
    throw new BusinessRuleError(req.id, 'the friend request does not exist')

  if (!FriendRequest.isPending(friendRequest))
    throw new BusinessRuleError(req.id, 'the friend request is not pending')

  if (friendRequest.toUserId !== req.userId)
    throw new BusinessRuleError(req.id, 'the user is not the receiver of the friend request')

  const userRelationship = await deps.findUserRelationshipBetween(
    friendRequest.fromUserId,
    friendRequest.toUserId
  )

  const isNewFriendRelationship = userRelationship === undefined
  const [, acceptedFriendRequestEvent] = FriendRequest.accept(friendRequest)
  const [, friendedRelationshipEvent] = isNewFriendRelationship
    ? UserRelationship.newFriend(friendRequest.fromUserId, friendRequest.toUserId)
    : UserRelationship.friend(userRelationship, friendRequest.fromUserId, friendRequest.toUserId)

  await deps.acceptFriendRequest(acceptedFriendRequestEvent)
  await deps.friendUser(isNewFriendRelationship, friendedRelationshipEvent)
  await deps.publishEvents(
    req.id,
    [acceptedFriendRequestEvent, friendedRelationshipEvent],
    req.userId
  )
}

export type Dependencies = {
  findFriendRequest: FriendRequest.FnFindOneById
  acceptFriendRequest: FriendRequest.FnAccept
  findUserRelationshipBetween: UserRelationship.FnFindOneBetweenUsers
  friendUser: UserRelationship.FnFriend
  publishEvents: EventData.FnPublishEvents
  // es_transaction: ES.FnTransaction
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly friendRequestId: string
}

export const validator = Joi.object<Request, true>({
  id: Uuid.validator.required(),
  userId: Uuid.validator.required(),
  friendRequestId: Uuid.validator.required(),
})
