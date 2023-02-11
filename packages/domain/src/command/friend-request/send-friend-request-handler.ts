import { BusinessRuleError, ES, INT, UA } from '../../modules'

export const handle = async (req: Request, deps: Dependencies): Promise<Response> => {
  ES.FriendRequest.validateInputFields(req.id, req.fromUserId, req.toUserId)

  // const lastFriendRequest = await deps.getLastFriendRequestBetweenUsers(req.fromUserId, req.toUserId)
  // if (lastFriendRequest?.tag === 'pending-aggregate')
  //   throw new BusinessRuleError(req.id, 'there is an already pending friend request')

  const fromUser = await deps.getUserById(req.fromUserId)
  if (fromUser === undefined) throw new BusinessRuleError(req.id, 'the from user does not exist')

  const toUser = await deps.getUserById(req.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(req.id, 'the to user does not exist')

  const [, createdFriendRequestEvent] = ES.FriendRequest.newA(req.fromUserId, req.toUserId)

  await deps.processEvent(createdFriendRequestEvent)

  return { friendRequestId: createdFriendRequestEvent.data.aggregateId }
}

export type Dependencies = {
  readonly getUserById: UA.User.FnGetById
  readonly getLastFriendRequestBetweenUsers: ES.FriendRequest.FnGetLastBetweenUsers
  readonly processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  id: string
  fromUserId: string
  toUserId: string
}

export type Response = {
  friendRequestId: string
}
