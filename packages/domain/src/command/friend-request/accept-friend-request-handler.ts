import Joi from 'joi'
import { BusinessRuleError, Event, FriendRequest, UserRelationship, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  const acceptedFriendRequestEventLookup = await deps.db_findAcceptedFriendRequestEvent(
    req.requestId,
    'friend-request-accepted'
  )

  const acceptedFriendRequestEvent =
    acceptedFriendRequestEventLookup === undefined
      ? FriendRequest.AcceptedEvent.create(req.requestId, req.friendRequest)
      : (acceptedFriendRequestEventLookup as FriendRequest.AcceptedEvent)

  const userRelationshipLookup = await deps.db_findUserRelationshipBetween(
    req.friendRequest.fromUserId,
    req.friendRequest.toUserId
  )
  const friendedRelationshipEvent =
    userRelationshipLookup === undefined
      ? UserRelationship.FriendedUserEvent.createNewRelationship(
          req.requestId,
          req.friendRequest.fromUserId,
          req.friendRequest.toUserId
        )
      : UserRelationship.FriendedUserEvent.createForExistingRelationship(
          req.requestId,
          userRelationshipLookup,
          req.friendRequest.fromUserId,
          req.friendRequest.toUserId
        )

  await deps.acceptFriendRequest(
    acceptedFriendRequestEvent,
    acceptedFriendRequestEventLookup === undefined,
    friendedRelationshipEvent,
    userRelationshipLookup === undefined
  )

  await deps.publishEvent(acceptedFriendRequestEvent)
}

export type Dependencies = {
  db_findAcceptedFriendRequestEvent: Event.DbQueries.FindEvent
  db_findUserRelationshipBetween: UserRelationship.DbQueries.FindBetweenUsers
  acceptFriendRequest: FriendRequest.Mutations.Accept
  publishEvent: Event.Mutations.PublishEvent
}

export type Request = {
  readonly requestId: string
  readonly friendRequest: FriendRequest.Aggregate<FriendRequest.PendingStatus>
}

export const id = 'accept-friend-request'

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
  findFriendRequest: FriendRequest.DbQueries.FindById
}

type ValidateResponse = {
  friendRequest: FriendRequest.Aggregate<FriendRequest.PendingStatus>
}

const syntaxValidator = Joi.object({
  friendRequestId: Uuid.validator.required(),
  userId: Uuid.validator.required(),
})
