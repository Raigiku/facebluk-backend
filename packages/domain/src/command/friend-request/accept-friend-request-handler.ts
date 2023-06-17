import { BusinessRuleError, ES, INT, Logger, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  const friendRequest = await deps.findFriendRequest(req.friendRequestId)
  if (friendRequest === undefined)
    throw new BusinessRuleError(req.id, 'the friend request does not exist')

  if (friendRequest.status.tag !== 'pending')
    throw new BusinessRuleError(req.id, 'the friend request is not pending')

  if (friendRequest.toUserId !== req.userId)
    throw new BusinessRuleError(req.id, 'the user is not the receiver of the friend request')

  const userRelationship = await deps.findUserRelationshipBetween(
    friendRequest.fromUserId,
    friendRequest.toUserId
  )

  const [, acceptedFriendRequestEvent] = ES.FriendRequest.accept(friendRequest)
  const [, friendedRelationshipEvent] =
    userRelationship === undefined
      ? ES.UserRelationship.newFriend(friendRequest.fromUserId, friendRequest.toUserId)
      : ES.UserRelationship.friend(
          userRelationship,
          friendRequest.fromUserId,
          friendRequest.toUserId
        )

  await deps.processEvents(
    req.id,
    [acceptedFriendRequestEvent, friendedRelationshipEvent],
    req.userId
  )
}

const validateInputFields = (req: Request) => {
  Uuid.validate(req.id, req.friendRequestId, 'friendRequestId')
  Uuid.validate(req.id, req.userId, 'userId')
}

export type Dependencies = {
  log: Logger.FnLog
  findFriendRequest: ES.FriendRequest.FnFindOneById
  findUserRelationshipBetween: ES.UserRelationship.FnFindOneBetweenUsers
  processEvents: INT.Event.FnProcessEvents
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly friendRequestId: string
}
