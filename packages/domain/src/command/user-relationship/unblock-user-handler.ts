import Joi from 'joi'
import { BusinessRuleError, EventData, User, UserRelationship, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  await validator.validateAsync(req)

  const toUser = await deps.findUserById(req.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(req.id, 'the to user does not exist')

  const userRelationship = await deps.findUserRelationshipBetween(req.userId, toUser.aggregate.id)
  if (userRelationship === undefined)
    throw new BusinessRuleError(req.id, 'the users dont have a relationship')

  if (!UserRelationship.isBlocked(userRelationship))
    throw new BusinessRuleError(req.id, 'the users are not blocked')

  if (
    UserRelationship.isBlocked(userRelationship) &&
    userRelationship.blockedStatus.fromUserId !== req.userId
  )
    throw new BusinessRuleError(req.id, 'the other user is the only that can unblock you')

  const [, unblockedEvent] = UserRelationship.unblock(userRelationship, req.userId, req.toUserId)

  await deps.publishEvent(req.id, unblockedEvent)
}

export type Dependencies = {
  findUserById: User.FnFindOneById
  findUserRelationshipBetween: UserRelationship.FnFindOneBetweenUsers
  publishEvent: EventData.FnPublishEvent
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
