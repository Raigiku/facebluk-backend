import Joi from 'joi'
import { BusinessRuleError, Event, User } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  const userRegisteredLookup = await deps.db_findUserRegisteredEvent(
    req.requestId,
    'user-registered'
  )

  const userRegisteredEvent =
    userRegisteredLookup === undefined
      ? User.RegisteredEvent.create(
          req.requestId,
          req.userAuthMetadata.userId,
          req.name,
          req.alias,
          req.profilePictureUrl
        )
      : (userRegisteredLookup as User.RegisteredEvent)

  await deps.registerUser(
    userRegisteredEvent,
    userRegisteredLookup === undefined,
    req.userAuthMetadata.registeredAt === undefined
  )

  await deps.publishEvent(userRegisteredEvent)
}

export type Dependencies = {
  db_findUserRegisteredEvent: Event.DbQueries.FindEvent
  registerUser: User.Mutations.Register
  publishEvent: Event.Mutations.PublishEvent
}

export type Request = {
  readonly requestId: string
  readonly userAuthMetadata: User.AuthMetadata
  readonly name: string
  readonly alias: string
  readonly profilePictureUrl?: string
}

export const id = 'register-user'

export const validate = async (requestId: string, payload: ValidatePayload, deps: ValidateDeps) => {
  await syntaxValidator.validateAsync(payload)

  const aliasExists = await deps.db_aliasExists(payload.alias)
  if (aliasExists) throw new BusinessRuleError(requestId, 'alias already exists')
}

type ValidatePayload = {
  readonly name: string
  readonly alias: string
  readonly profilePictureUrl?: string
}

type ValidateDeps = {
  db_aliasExists: User.DbQueries.AliasExists
}

const syntaxValidator = Joi.object<ValidatePayload, true>({
  name: User.nameValidator.required(),
  alias: User.aliasValidator.required(),
  profilePictureUrl: Joi.string().uri(),
})
