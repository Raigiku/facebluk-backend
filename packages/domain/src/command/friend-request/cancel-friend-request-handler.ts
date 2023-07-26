import Joi from 'joi'
import { BusinessRuleError, ES, INT, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  await validator.validateAsync(req)

  const friendRequest = await deps.es_findFriendRequestById(req.friendRequestId)
  if (friendRequest === undefined)
    throw new BusinessRuleError(req.id, 'the friend request does not exist')

  if (!ES.FriendRequest.isPending(friendRequest))
    throw new BusinessRuleError(req.id, 'the friend request is not pending')

  if (friendRequest.fromUserId !== req.userId)
    throw new BusinessRuleError(req.id, 'the user is not the sender of the friend request')

  const [, cancelledFriendRequestEvent] = ES.FriendRequest.cancel(friendRequest)

  await deps.es_cancelFriendRequest(cancelledFriendRequestEvent)
  await deps.int_processEvent(req.id, cancelledFriendRequestEvent)
}

export type Dependencies = {
  es_findFriendRequestById: ES.FriendRequest.FnFindOneById
  es_cancelFriendRequest: ES.FriendRequest.FnCancel

  int_processEvent: INT.Event.FnProcessEvent
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
