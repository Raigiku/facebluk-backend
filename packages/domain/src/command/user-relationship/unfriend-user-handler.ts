import Joi from 'joi'
import { BusinessRuleError, Event, User, UserRelationship, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  const unfriendedLookup = await deps.db_findUnfriendedEvent(
    req.requestId,
    'user-relationship-unfriended'
  )

  const unfriendedEvent =
    unfriendedLookup === undefined
      ? UserRelationship.UnfriendedUserEvent.create(
        req.requestId,
        req.userRelationship,
        req.fromUserId,
        req.toUserId
      )
      : unfriendedLookup as UserRelationship.UnfriendedUserEvent

  await deps.unfriend(unfriendedEvent, unfriendedLookup === undefined)

  await deps.publishEvent(unfriendedEvent)
}

export type Dependencies = {
  db_findUnfriendedEvent: Event.DbQueries.FindEvent
  unfriend: UserRelationship.Mutations.Unfriend
  publishEvent: Event.Mutations.PublishEvent
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

  const toUser = await deps.findUserById(payload.toUserId)
  if (toUser === undefined) throw new BusinessRuleError(requestId, 'the other user does not exist')

  const userRelationship = await deps.findRelationshipBetweenUsers(
    payload.fromUserId,
    payload.toUserId
  )
  if (userRelationship === undefined || !UserRelationship.isFriend(userRelationship))
    throw new BusinessRuleError(requestId, 'users are not friends')

  return { userRelationship }
}

type ValidatePayload = {
  readonly fromUserId: string
  readonly toUserId: string
}

type ValidateDeps = {
  findUserById: User.DbQueries.FindById
  findRelationshipBetweenUsers: UserRelationship.DbQueries.FindBetweenUsers
}

type ValidateResponse = {
  userRelationship: UserRelationship.Aggregate<
    UserRelationship.BlockStatus,
    UserRelationship.FriendedStatus
  >
}

const syntaxValidator = Joi.object<ValidatePayload, true>({
  fromUserId: Uuid.validator.required(),
  toUserId: Uuid.validator.disallow(Joi.ref('userId')).required().messages({
    'any.invalid': 'you cannot unfriend yourself',
  }),
})
