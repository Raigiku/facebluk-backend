import Joi from 'joi'
import { BusinessRuleError, EventData, FriendRequest, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  await validator.validateAsync(req)

  const friendRequest = await deps.findFriendRequestById(req.friendRequestId)
  if (friendRequest === undefined)
    throw new BusinessRuleError(req.id, 'the friend request does not exist')

  if (!FriendRequest.isPending(friendRequest))
    throw new BusinessRuleError(req.id, 'the friend request is not pending')

  if (friendRequest.fromUserId !== req.userId)
    throw new BusinessRuleError(req.id, 'the user is not the sender of the friend request')

  const [, cancelledFriendRequestEvent] = FriendRequest.cancel(friendRequest)

  await deps.cancelFriendRequest(cancelledFriendRequestEvent)
  await deps.publishEvent(req.id, cancelledFriendRequestEvent)
}

export type Dependencies = {
  findFriendRequestById: FriendRequest.FnFindOneById
  cancelFriendRequest: FriendRequest.FnCancel
  publishEvent: EventData.FnPublishEvent
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
