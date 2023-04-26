import { BusinessRuleError, ES, FS, INT, RequestImage, UA, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  const isAliasAvailable = await deps.isAliasAvailable(req.alias)
  if (!isAliasAvailable) throw new BusinessRuleError(req.id, 'alias is already used')

  let profilePictureUrl: string | undefined = undefined
  if (req.profilePicture !== undefined) {
    await deps.uploadProfilePicture(req.userId, req.profilePicture.bytes)
    profilePictureUrl = deps.getUserProfilePictureUrl(req.userId)
  }

  let registeredUserEvent = await deps.getRegisteredUserEvent(req.userId)
  if (registeredUserEvent === undefined) {
    registeredUserEvent = ES.User.create(req.userId, req.name, req.alias, profilePictureUrl)[1]
    await deps.processEvent(req.id, registeredUserEvent)
  }

  const user = await deps.getUserById(req.userId)
  if (user === undefined) throw new BusinessRuleError(req.id, 'user does not exist')

  if (!UA.User.isRegistered(user))
    await deps.markUserAsRegistered(req.userId, registeredUserEvent.data.createdAt)
}

const validateInputFields = (req: Request) => {
  Uuid.validate(req.id, req.userId, 'userId')
  ES.User.validateName(req.id, req.name)
  ES.User.validateAlias(req.id, req.alias)
  if (req.profilePicture !== undefined) RequestImage.validate(req.id, req.profilePicture)
}

export type Dependencies = {
  readonly isAliasAvailable: ES.User.FnIsAliasAvailable
  readonly getRegisteredUserEvent: ES.User.FnGetRegisteredUserEvent
  readonly uploadProfilePicture: FS.User.FnUploadProfilePicture
  readonly getUserProfilePictureUrl: FS.User.FnGetProfilePictureUrl
  readonly getUserById: UA.User.FnGetById
  readonly processEvent: INT.Event.FnProcessEvent
  readonly markUserAsRegistered: UA.User.FnMarkUserAsRegistered
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly name: string
  readonly alias: string
  readonly profilePicture?: RequestImage.Data
}
