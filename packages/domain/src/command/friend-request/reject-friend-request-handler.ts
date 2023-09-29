import Joi from 'joi'
import { BusinessRuleError, Event, FriendRequest, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  const friendRequestEventLookup =
    await deps.db_findFriendRequestEvent<FriendRequest.RejectedEvent>(req.requestId)

  const rejectedFriendRequestEvent =
    friendRequestEventLookup === undefined
      ? FriendRequest.RejectedEvent.create(req.requestId, req.friendRequest)
      : friendRequestEventLookup

  await deps.rejectFriendRequest(rejectedFriendRequestEvent, friendRequestEventLookup === undefined)

  await deps.publishEvent(rejectedFriendRequestEvent)
}

export type Dependencies = {
  db_findFriendRequestEvent: Event.DbQueries.FindEvent
  rejectFriendRequest: FriendRequest.Mutations.Reject
  publishEvent: Event.Mutations.PublishEvent
}

export type Request = {
  readonly requestId: string
  readonly friendRequest: FriendRequest.Aggregate<FriendRequest.PendingStatus>
}

export const id = 'reject-friend-request'

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

  if (friendRequest.toUserId !== payload.userId)
    throw new BusinessRuleError(requestId, 'the user is not the receiver of the friend request')

  return { friendRequest }
}

type ValidatePayload = {
  readonly friendRequestId: string
  readonly userId: string
}

type ValidateDeps = {
  findFriendRequest: FriendRequest.DbQueries.FindOneById
}

type ValidateResponse = {
  readonly friendRequest: FriendRequest.Aggregate<FriendRequest.PendingStatus>
}

const syntaxValidator = Joi.object({
  friendRequestId: Uuid.validator.required(),
  userId: Uuid.validator.required(),
})
