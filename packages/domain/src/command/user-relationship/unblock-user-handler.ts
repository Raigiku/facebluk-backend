import { BusinessRuleError, ES, INT, UA, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  const toUser = await deps.findUserById(req.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(req.id, 'the to user does not exist')

  const userRelationship = await deps.findUserRelationshipBetween(req.userId, toUser.id)
  if (userRelationship?.blockedStatus.tag !== 'blocked')
    throw new BusinessRuleError(req.id, 'the users are not blocked')

  if (
    userRelationship.blockedStatus.tag === 'blocked' &&
    userRelationship.blockedStatus.fromUserId !== req.userId
  )
    throw new BusinessRuleError(req.id, 'the other user is the only that can unblock you')

  const [, unblockedEvent] = ES.UserRelationship.unblock(userRelationship, req.userId, req.toUserId)

  await deps.processEvent(req.id, unblockedEvent)
}

const validateInputFields = (req: Request) => {
  Uuid.validate(req.id, req.userId, 'userId')
  Uuid.validate(req.id, req.toUserId, 'toUserId')
}

export type Dependencies = {
  findUserById: UA.User.FnFindOneById
  findUserRelationshipBetween: ES.UserRelationship.FnFindOneBetweenUsers
  processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly toUserId: string
}
