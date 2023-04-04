import { BusinessRuleError, ES, INT, UA, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  const toUser = await deps.getUserById(req.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(req.id, 'the to user does not exist')

  const userRelationship = await deps.getUserRelationshipBetween(req.userId, toUser.id)

  if (userRelationship?.blockedStatus.tag === 'blocked')
    throw new BusinessRuleError(req.id, 'users are already blocked')

  const [, blockedEvent] =
    userRelationship === undefined
      ? ES.UserRelationship.newBlock(req.userId, toUser.id)
      : ES.UserRelationship.block(userRelationship, req.userId, toUser.id)

  await deps.processEvent(req.id, blockedEvent)
}

const validateInputFields = (req: Request) => {
  Uuid.validate(req.id, req.userId, 'userId')
  Uuid.validate(req.id, req.toUserId, 'toUserId')
}

export type Dependencies = {
  readonly getUserById: UA.User.FnGetById
  readonly getUserRelationshipBetween: ES.UserRelationship.FnGetBetweenUsers
  readonly processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly toUserId: string
}
