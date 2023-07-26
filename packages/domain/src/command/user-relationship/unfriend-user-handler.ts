import Joi from 'joi'
import { BusinessRuleError, ES, INT, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  await validator.validateAsync(req)

  deps.es_findUserRelationshipBetween
  const toUser = await deps.es_findUserById(req.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(req.id, 'the to user does not exist')

  const userRelationship = await deps.es_findUserRelationshipBetween(
    req.userId,
    toUser.aggregate.id
  )
  if (userRelationship === undefined || !ES.UserRelationship.isFriend(userRelationship))
    throw new BusinessRuleError(req.id, 'the users are not friends')

  const [, unfriendedEvent] = ES.UserRelationship.unfriend(
    userRelationship,
    req.userId,
    req.toUserId
  )

  await deps.es_unfriend(unfriendedEvent)
  await deps.int_processEvent(req.id, unfriendedEvent)
}

export type Dependencies = {
  es_findUserRelationshipBetween: ES.UserRelationship.FnFindOneBetweenUsers
  es_unfriend: ES.UserRelationship.FnUnfriend
  es_findUserById: ES.User.FnFindOneById

  int_processEvent: INT.Event.FnProcessEvent
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
