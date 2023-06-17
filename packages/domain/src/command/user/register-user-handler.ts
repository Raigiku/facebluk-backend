import { BusinessRuleError, ES, FS, INT, RequestImage, UA, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  const aliasExists = await deps.es_aliasExists(req.alias)
  if (aliasExists) throw new BusinessRuleError(req.id, 'alias is already used')

  let profilePictureUrl: string | undefined = undefined
  if (req.profilePicture !== undefined) {
    await deps.fs_uploadProfilePicture(req.userId, req.profilePicture.bytes)
    profilePictureUrl = deps.fs_findUserProfilePictureUrl(req.userId)
  }

  let esUser = await deps.es_findUserById(req.userId)
  if (esUser === undefined) {
    const [newUser, registeredUserEvent] = ES.User.create(
      req.userId,
      req.name,
      req.alias,
      profilePictureUrl
    )
    esUser = newUser
    await deps.es_registerUser(newUser, registeredUserEvent)
    await deps.int_processEvent(req.id, registeredUserEvent)
  }

  const uaUser = await deps.ua_findUserById(req.userId)
  if (uaUser === undefined) throw new BusinessRuleError(req.id, 'user does not exist')

  if (!UA.User.isRegistered(uaUser))
    await deps.ua_markUserAsRegistered(req.userId, esUser.aggregate.createdAt)
}

const validateInputFields = (req: Request) => {
  Uuid.validate(req.id, req.userId, 'userId')
  ES.User.validateName(req.id, req.name)
  ES.User.validateAlias(req.id, req.alias)
  if (req.profilePicture !== undefined) RequestImage.validate(req.id, req.profilePicture)
}

export type Dependencies = {
  es_aliasExists: ES.User.FnAliasExists
  es_findUserById: ES.User.FnFindOneById
  es_registerUser: ES.User.FnRegister

  fs_uploadProfilePicture: FS.User.FnUploadProfilePicture
  fs_findUserProfilePictureUrl: FS.User.FnFindProfilePictureUrl

  ua_findUserById: UA.User.FnFindOneById
  ua_markUserAsRegistered: UA.User.FnMarkUserAsRegistered

  int_processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly name: string
  readonly alias: string
  readonly profilePicture?: RequestImage.Data
}
