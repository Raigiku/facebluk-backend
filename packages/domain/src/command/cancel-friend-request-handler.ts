import { BusinessRuleError, ES, INT, UA, Uuid } from '../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  Uuid.validate(req.id, req.friendRequestId, 'friendRequestId')

  const friendRequest = await deps.getFriendRequestById(req.friendRequestId)
  if (friendRequest === undefined) throw new BusinessRuleError(req.id, 'the friend request does not exist')

  const user = await deps.getUserById(req.userId)
  if (user === undefined) throw new BusinessRuleError(req.id, 'user not found')

  if (friendRequest.fromUserId !== user.id)
    throw new BusinessRuleError(req.id, 'the user is not the sender of the friend request')

  const [, cancelledFriendRequestEvent] = ES.FriendRequest.cancel(friendRequest)

  await deps.processEvent(cancelledFriendRequestEvent)
}

export type Dependencies = {
  readonly getUserById: UA.User.FnGetById
  readonly getFriendRequestById: ES.FriendRequest.FnGet
  readonly processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  id: string
  userId: string
  friendRequestId: string
}
