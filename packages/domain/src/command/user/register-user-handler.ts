import Joi from 'joi'
import { BusinessRuleError, Event, File, RequestImage, User } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  let profilePictureUrl: string | undefined = undefined
  if (req.profilePicture !== undefined) {
    const bucket = 'images'
    const filePath = `users/${req.userAuthMetadata.id}/${req.profilePicture.id}`
    await deps.uploadFile(bucket, filePath, req.profilePicture.bytes)
    profilePictureUrl = deps.findFileUrl(bucket, filePath)
  }

  let registeredEvent = await deps.findUserRegisteredEvent(req.userAuthMetadata.id)
  if (registeredEvent === undefined) {
    const newRegisteredEvent = User.register(
      req.userAuthMetadata.id,
      req.name,
      req.alias,
      profilePictureUrl
    )
    registeredEvent = newRegisteredEvent
    await deps.registerUser(newRegisteredEvent)
    await deps.publishEvent(req.requestId, newRegisteredEvent)
  }

  if (!User.isRegistered(req.userAuthMetadata))
    await deps.markUserAsRegistered(req.userAuthMetadata.id, registeredEvent.data.createdAt)
}

export type Dependencies = {
  findUserRegisteredEvent: User.FnFindRegisteredEvent
  registerUser: User.FnRegister
  uploadFile: File.FnUpload
  findFileUrl: File.FnFindFileUrl
  markUserAsRegistered: User.FnMarkAsRegistered
  publishEvent: Event.FnPublishEvent
}

export type Request = {
  readonly requestId: string
  readonly userAuthMetadata: User.AuthMetadata
  readonly name: string
  readonly alias: string
  readonly profilePicture?: RequestImage
}

export const id = 'register-user'

export const validate = async (requestId: string, payload: ValidatePayload, deps: ValidateDeps) => {
  await syntaxValidator.validateAsync(payload)

  const aliasExists = await deps.aliasExists(payload.alias)
  if (aliasExists) throw new BusinessRuleError(requestId, 'alias already exists')
}

type ValidatePayload = {
  readonly name: string
  readonly alias: string
  readonly profilePicture?: RequestImage
}

type ValidateDeps = {
  aliasExists: User.FnAliasExists
}

const syntaxValidator = Joi.object({
  name: User.nameValidator.required(),
  alias: User.aliasValidator.required(),
  profilePicture: RequestImage.validator,
})
