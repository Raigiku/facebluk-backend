import Joi from 'joi'
import { BusinessRuleError, Event, FriendRequest, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  const cancelledFriendRequestEventLookup = await deps.db_findCancelledFriendRequestEvent(
    req.requestId,
    'friend-request-cancelled'
  )

  const cancelledFriendRequestEvent =
    cancelledFriendRequestEventLookup === undefined
      ? FriendRequest.CancelledEvent.create(req.requestId, req.friendRequest)
      : (cancelledFriendRequestEventLookup as FriendRequest.CancelledEvent)

  await deps.cancelFriendRequest(
    cancelledFriendRequestEvent,
    cancelledFriendRequestEventLookup === undefined
  )

  await deps.publishEvent(cancelledFriendRequestEvent)
}

export type Dependencies = {
  db_findCancelledFriendRequestEvent: Event.DbQueries.FindEvent
  cancelFriendRequest: FriendRequest.Mutations.Cancel
  publishEvent: Event.Mutations.PublishEvent
}

export type Request = {
  readonly requestId: string
  readonly friendRequest: FriendRequest.Aggregate<FriendRequest.PendingStatus>
}

export const id = 'cancel-friend-request'

export const validate = async (
  requestId: string,
  payload: ValidatePayload,
  deps: ValidateDeps
): Promise<ValidateResponse> => {
  await syntaxValidator.validateAsync(payload)

  const friendRequest = await deps.findFriendRequest(payload.friendRequestId)
  if (friendRequest === undefined)
    throw new BusinessRuleError(requestId, 'the friend request does not exist')

  if (!FriendRequest.isPending(friendRequest))
    throw new BusinessRuleError(requestId, 'the friend request is not pending')

  if (friendRequest.fromUserId !== payload.userId)
    throw new BusinessRuleError(requestId, 'the user is not the sender of the friend request')

  return { friendRequest }
}

type ValidatePayload = {
  readonly friendRequestId: string
  readonly userId: string
}

type ValidateDeps = {
  findFriendRequest: FriendRequest.DbQueries.FindById
}

type ValidateResponse = {
  readonly friendRequest: FriendRequest.Aggregate<FriendRequest.PendingStatus>
}

const syntaxValidator = Joi.object({
  friendRequestId: Uuid.validator.required(),
  userId: Uuid.validator.required(),
})
