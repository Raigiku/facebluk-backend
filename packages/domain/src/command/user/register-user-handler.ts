import Joi from 'joi'
import { BusinessRuleError, EventData, RequestImage, User, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  await validator.validateAsync(req)

  const aliasExists = await deps.aliasExists(req.alias)
  if (aliasExists) throw new BusinessRuleError(req.id, 'alias is already used')

  let profilePictureUrl: string | undefined = undefined
  if (req.profilePicture !== undefined) {
    await deps.uploadProfilePicture(req.userId, req.profilePicture.bytes)
    profilePictureUrl = deps.findProfilePictureUrl(req.userId)
  }

  let user = await deps.findUserById(req.userId)
  if (user === undefined) {
    const [newUser, registeredUserEvent] = User.register(
      req.userId,
      req.name,
      req.alias,
      profilePictureUrl
    )
    user = newUser
    await deps.registerUser(registeredUserEvent)
    await deps.publishEvent(req.id, registeredUserEvent)
  }

  const authMetadata = await deps.findUserAuthMetadata(req.userId)
  if (authMetadata === undefined) throw new BusinessRuleError(req.id, 'user does not exist')

  if (!User.isRegistered(authMetadata))
    await deps.markUserAsRegistered(req.userId, user.aggregate.createdAt)
}

export type Dependencies = {
  aliasExists: User.FnAliasExists
  findUserById: User.FnFindOneById
  registerUser: User.FnRegister
  uploadProfilePicture: User.FnUploadProfilePicture
  findProfilePictureUrl: User.FnFindProfilePictureUrl
  findUserAuthMetadata: User.FnFindAuthMetadata
  markUserAsRegistered: User.FnMarkAsRegistered
  publishEvent: EventData.FnPublishEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly name: string
  readonly alias: string
  readonly profilePicture?: RequestImage.Data
}

export const validator = Joi.object<Request, true>({
  id: Uuid.validator.required(),
  userId: Uuid.validator.required(),
  name: User.nameValidator.required(),
  alias: User.aliasValidator.required(),
  profilePicture: RequestImage.validator.required(),
})
