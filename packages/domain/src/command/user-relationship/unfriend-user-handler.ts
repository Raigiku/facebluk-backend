import Joi from 'joi'
import { BusinessRuleError, Event, User, UserRelationship, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  const unfriendedEvent = UserRelationship.unfriend(, req.userId, req.otherUserId)
  await deps.unfriend(unfriendedEvent)
  await deps.publishEvent(req.requestId, unfriendedEvent)
}

export type Dependencies = {
  findUserRelationshipBetween: UserRelationship.FnFindOneBetweenUsers
  unfriend: UserRelationship.FnUnfriend
  findUserById: User.FnFindOneById
  publishEvent: Event.FnPublishEvent
}

export type Request = {
  readonly requestId: string
  readonly userId: string
  readonly otherUserId: string
}

export const id = 'unfriend-user'

export const validate = async (
  requestId: string,
  payload: ValidatePayload,
  deps: ValidateDeps
) => {
  await syntaxValidator.validateAsync(payload)
  
  const otherUser = await deps.findUserById(payload.otherUserId)
  if (otherUser === undefined)
    throw new BusinessRuleError(requestId, 'the other user does not exist')

    if(payload.userId===payload.otherUserId)
      throw new BusinessRuleError(requestId, 'cannot unfriend yourself')

  const areUsersFriends = await deps.areUsersFriends(
    payload.userId,
    payload.otherUserId
  )
  if (!areUsersFriends) 
    throw new BusinessRuleError(requestId, 'users are not friends')
}

type ValidatePayload = {
  readonly userId: string
  readonly otherUserId: string
}

type ValidateDeps = {
  findUserById: User.FnFindOneById
  areUsersFriends: User.FnAreFriends
}

const syntaxValidator = Joi.object({
  otherUserId: Uuid.validator.required()
})
