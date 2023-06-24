import { BusinessRuleError, ES, INT, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  const toUser = await deps.findUserById(req.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(req.id, 'the to user does not exist')

  const userRelationship = await deps.findUserRelationshipBetween(req.userId, toUser.aggregate.id)

  if (userRelationship !== undefined && ES.UserRelationship.isBlocked(userRelationship))
    throw new BusinessRuleError(req.id, 'users are already blocked')

  const [, blockedEvent] =
    userRelationship === undefined
      ? ES.UserRelationship.newBlock(req.userId, toUser.aggregate.id)
      : ES.UserRelationship.block(userRelationship, req.userId, toUser.aggregate.id)

  await deps.processEvent(req.id, blockedEvent)
}

const validateInputFields = (req: Request) => {
  Uuid.validate(req.id, req.userId, 'userId')
  Uuid.validate(req.id, req.toUserId, 'toUserId')
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
