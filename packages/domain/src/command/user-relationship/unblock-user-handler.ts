import Joi from 'joi'
import { BusinessRuleError, ES, INT, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  await validator.validateAsync(req)

  const toUser = await deps.findUserById(req.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(req.id, 'the to user does not exist')

  const userRelationship = await deps.findUserRelationshipBetween(req.userId, toUser.aggregate.id)
  if (userRelationship === undefined)
    throw new BusinessRuleError(req.id, 'the users dont have a relationship')

  if (!ES.UserRelationship.isBlocked(userRelationship))
    throw new BusinessRuleError(req.id, 'the users are not blocked')

  if (
    ES.UserRelationship.isBlocked(userRelationship) &&
    userRelationship.blockedStatus.fromUserId !== req.userId
  )
    throw new BusinessRuleError(req.id, 'the other user is the only that can unblock you')

  const [, unblockedEvent] = ES.UserRelationship.unblock(userRelationship, req.userId, req.toUserId)

  await deps.processEvent(req.id, unblockedEvent)
}

export type Dependencies = {
  findUserById: ES.User.FnFindOneById
  findUserRelationshipBetween: ES.UserRelationship.FnFindOneBetweenUsers
  processEvent: INT.Event.FnProcessEvent
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
