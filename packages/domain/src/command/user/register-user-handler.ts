import { BusinessRuleError, ES, FS, INT, RequestImage, UA, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  let profilePictureUrl = deps.getUserProfilePictureUrl(req.userId)
  if (profilePictureUrl === undefined)
    if (req.profilePicture !== undefined)
      profilePictureUrl = await deps.uploadProfilePicture(req.userId, req.profilePicture.bytes)

  let registeredUserEvent = await deps.getRegisteredUserEvent(req.userId)
  if (registeredUserEvent === undefined) {
    registeredUserEvent = ES.User.create(req.userId, req.name, profilePictureUrl)[1]
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
  if (req.profilePicture !== undefined) RequestImage.validate(req.id, req.profilePicture)
}

export type Dependencies = {
  readonly getRegisteredUserEvent: ES.User.FnGetRegisteredUserEvent
  readonly getUserProfilePictureUrl: FS.User.FnGetProfilePictureUrl
  readonly uploadProfilePicture: FS.User.FnUploadProfilePicture
  readonly getUserById: UA.User.FnGetById
  readonly processEvent: INT.Event.FnProcessEvent
  readonly markUserAsRegistered: UA.User.FnMarkUserAsRegistered
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly name: string
  readonly profilePicture?: RequestImage.Data
}