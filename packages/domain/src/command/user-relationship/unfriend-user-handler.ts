import Joi from 'joi'
import { BusinessRuleError, Event, User, UserRelationship, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  await validator.validateAsync(req)

  const toUser = await deps.findUserById(req.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(req.id, 'the to user does not exist')

  const userRelationship = await deps.findUserRelationshipBetween(req.userId, toUser.aggregate.id)
  if (userRelationship === undefined || !UserRelationship.isFriend(userRelationship))
    throw new BusinessRuleError(req.id, 'the users are not friends')

  const [, unfriendedEvent] = UserRelationship.unfriend(userRelationship, req.userId, req.toUserId)

  await deps.unfriend(unfriendedEvent)
  await deps.publishEvent(req.id, unfriendedEvent)
}

export type Dependencies = {
  findUserRelationshipBetween: UserRelationship.FnFindOneBetweenUsers
  unfriend: UserRelationship.FnUnfriend
  findUserById: User.FnFindOneById
  publishEvent: Event.FnPublishEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly toUserId: string
}

export const validator = Joi.object<Request, true>({
  id: Uuid.validator.required(),
  userId: Uuid.validator.required(),
  toUserId: Uuid.validator.required(),
})
