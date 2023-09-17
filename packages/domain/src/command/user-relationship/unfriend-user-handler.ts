import Joi from 'joi'
import { BusinessRuleError, Event, User, UserRelationship, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  const unfriendedEvent = UserRelationship.unfriend(
    req.userRelationship,
    req.fromUserId,
    req.toUserId
  )
  await deps.unfriend(unfriendedEvent)
  await deps.publishEvent(req.requestId, unfriendedEvent)
}

export type Dependencies = {
  findUserRelationshipBetween: UserRelationship.FnFindOneBetweenUsers
  unfriend: UserRelationship.FnUnfriend
  publishEvent: Event.FnPublishEvent
}

export type Request = {
  readonly requestId: string
  readonly fromUserId: string
  readonly toUserId: string
  readonly userRelationship: UserRelationship.Aggregate<
    UserRelationship.BlockStatus,
    UserRelationship.FriendedStatus
  >
}

export const id = 'unfriend-user'

export const validate = async (
  requestId: string,
  payload: ValidatePayload,
  deps: ValidateDeps
): Promise<ValidateResponse> => {
  await syntaxValidator.validateAsync(payload)

  const otherUser = await deps.findUserById(payload.otherUserId)
  if (otherUser === undefined)
    throw new BusinessRuleError(requestId, 'the other user does not exist')

  if (payload.userId === payload.otherUserId)
    throw new BusinessRuleError(requestId, 'cannot unfriend yourself')

  const userRelationship = await deps.findRelationshipBetweenUsers(
    payload.userId,
    payload.otherUserId
  )
  if (userRelationship === undefined || !UserRelationship.isFriend(userRelationship))
    throw new BusinessRuleError(requestId, 'users are not friends')

  return { userRelationship }
}

type ValidatePayload = {
  readonly userId: string
  readonly otherUserId: string
}

type ValidateDeps = {
  findUserById: User.FnFindOneById
  findRelationshipBetweenUsers: UserRelationship.FnFindOneBetweenUsers
}

type ValidateResponse = {
  userRelationship: UserRelationship.Aggregate<
    UserRelationship.BlockStatus,
    UserRelationship.FriendedStatus
  >
}

const syntaxValidator = Joi.object({
  otherUserId: Uuid.validator.required(),
})
