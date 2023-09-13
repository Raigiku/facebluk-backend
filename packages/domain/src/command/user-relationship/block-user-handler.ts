import Joi from 'joi'
import { BusinessRuleError, Event, User, UserRelationship, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  await validator.validateAsync(req)

  const toUser = await deps.findUserById(req.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(req.id, 'the to user does not exist')

  const userRelationship = await deps.findUserRelationshipBetween(req.userId, toUser.aggregate.id)

  if (userRelationship !== undefined && UserRelationship.isBlocked(userRelationship))
    throw new BusinessRuleError(req.id, 'users are already blocked')

  const [, blockedEvent] =
    userRelationship === undefined
      ? UserRelationship.newBlock(req.userId, toUser.aggregate.id)
      : UserRelationship.block(userRelationship, req.userId, toUser.aggregate.id)

  await deps.publishEvent(req.id, blockedEvent)
}

export type Dependencies = {
  findUserById: User.FnFindOneById
  findUserRelationshipBetween: UserRelationship.FnFindOneBetweenUsers
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
