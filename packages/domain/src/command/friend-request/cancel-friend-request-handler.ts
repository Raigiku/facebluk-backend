import { BusinessRuleError, ES, INT, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  const friendRequest = await deps.getFriendRequestById(req.friendRequestId)
  if (friendRequest === undefined)
    throw new BusinessRuleError(req.id, 'the friend request does not exist')

  if (friendRequest.status.tag !== 'pending')
    throw new BusinessRuleError(req.id, 'the friend request is not pending')

  if (friendRequest.fromUserId !== req.userId)
    throw new BusinessRuleError(req.id, 'the user is not the sender of the friend request')

  const [, cancelledFriendRequestEvent] = ES.FriendRequest.cancel(friendRequest)

  await deps.processEvent(req.id, cancelledFriendRequestEvent)
}

const validateInputFields = (req: Request) => {
  Uuid.validate(req.id, req.friendRequestId, 'friendRequestId')
  Uuid.validate(req.id, req.userId, 'userId')
}

export type Dependencies = {
  getFriendRequestById: ES.FriendRequest.FnGet
  processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly friendRequestId: string
}
