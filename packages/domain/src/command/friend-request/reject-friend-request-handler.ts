import { BusinessRuleError, ES, INT, UA, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  const friendRequest = await deps.getFriendRequestById(req.friendRequestId)
  if (friendRequest === undefined) throw new BusinessRuleError(req.id, 'the friend request does not exist')

  if (friendRequest.tag !== 'pending-aggregate')
    throw new BusinessRuleError(req.id, 'the friend request is not pending')

  const user = await deps.getUserById(req.userId)
  if (user === undefined) throw new BusinessRuleError(req.id, 'user not found')

  if (friendRequest.toUserId !== user.id)
    throw new BusinessRuleError(req.id, 'the user is not the receiver of the friend request')

  const [, rejectedFriendRequestEvent] = ES.FriendRequest.reject(friendRequest)

  await deps.processEvent(req.id, req.userId, rejectedFriendRequestEvent)
}

const validateInputFields = (req: Request) => {
  Uuid.validate(req.id, req.friendRequestId, 'friendRequestId')
  Uuid.validate(req.id, req.userId, 'userId')
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
