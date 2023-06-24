import { BusinessRuleError, ES, INT, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  const friendRequest = await deps.es_findFriendRequestById(req.friendRequestId)
  if (friendRequest === undefined)
    throw new BusinessRuleError(req.id, 'the friend request does not exist')

  if (!ES.FriendRequest.isPending(friendRequest))
    throw new BusinessRuleError(req.id, 'the friend request is not pending')

  if (friendRequest.toUserId !== req.userId)
    throw new BusinessRuleError(req.id, 'the user is not the receiver of the friend request')

  const [, rejectedFriendRequestEvent] = ES.FriendRequest.reject(friendRequest)

  await deps.es_rejectFriendRequest(rejectedFriendRequestEvent)
  await deps.int_processEvent(req.id, rejectedFriendRequestEvent)
}

const validateInputFields = (req: Request) => {
  Uuid.validate(req.id, req.friendRequestId, 'friendRequestId')
  Uuid.validate(req.id, req.userId, 'userId')
}

export type Dependencies = {
  es_findFriendRequestById: ES.FriendRequest.FnFindOneById
  es_rejectFriendRequest: ES.FriendRequest.FnReject

  int_processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly friendRequestId: string
}
