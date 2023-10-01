import Joi from 'joi'
import { BusinessRuleError, Event, User } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  const infoUpdatedLookup = await deps.db_findInfoUpdatedEvent(req.requestId, 'user-info-updated')

  const infoUpdatedEvent =
    infoUpdatedLookup === undefined
      ? User.InfoUpdatedEvent.create(req.requestId, req.user, req.name, req.profilePictureUrl)
      : (infoUpdatedLookup as User.InfoUpdatedEvent)

  await deps.updateUserInfo(infoUpdatedEvent, infoUpdatedLookup === undefined)

  await deps.publishEvent(infoUpdatedEvent)
}

export type Dependencies = {
  db_findInfoUpdatedEvent: Event.DbQueries.FindEvent
  updateUserInfo: User.Mutations.UpdateInfo
  publishEvent: Event.Mutations.PublishEvent
}

export type Request = {
  readonly requestId: string
  readonly user: User.Aggregate
  readonly name?: string
  readonly profilePictureUrl?: string | null
}

export const id = 'update-user-info'

export const validate = async (
  requestId: string,
  payload: ValidatePayload,
  deps: ValidateDeps
): Promise<ValidateResponse> => {
  await syntaxValidator.validateAsync(payload)

  if (payload.name === undefined && payload.profilePictureUrl === undefined)
    throw new BusinessRuleError(requestId, '"name" and "profilePicture" are both undefined')

  const user = await deps.findUserById(payload.userId)
  if (user === undefined) throw new BusinessRuleError(requestId, 'user does not exist')

  return { user }
}

type ValidatePayload = {
  readonly name?: string
  readonly profilePictureUrl?: string | null
  readonly userId: string
}

type ValidateDeps = {
  findUserById: User.DbQueries.FindOneById
}

type ValidateResponse = {
  user: User.Aggregate
}

const syntaxValidator = Joi.object({
  name: User.nameValidator,
  profilePictureUrl: Joi.string().uri(),
})
