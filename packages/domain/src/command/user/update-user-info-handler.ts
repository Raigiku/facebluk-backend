import { BusinessRuleError, ES, FS, INT, RequestImage, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  const user = await deps.es_findUserById(req.userId)
  if (user === undefined) throw new BusinessRuleError(req.id, 'user does not exist')

  let profilePictureUrl: string | undefined = undefined
  if (req.profilePicture !== undefined) {
    await deps.fs_uploadProfilePicture(req.userId, req.profilePicture.bytes)
    profilePictureUrl = deps.fs_findUserProfilePictureUrl(req.userId)
  }

  const [, infoUpdatedEvent] = ES.User.updateInfo(user, req.name, profilePictureUrl)

  await deps.es_updateInfo(infoUpdatedEvent)
  await deps.int_processEvent(req.id, infoUpdatedEvent)
}

const validateInputFields = (req: Request) => {
  Uuid.validate(req.id, req.userId, 'userId')
  if (req.name !== undefined) ES.User.validateName(req.id, req.name)
  if (req.profilePicture !== undefined) RequestImage.validate(req.id, req.profilePicture)
}

export type Dependencies = {
  es_findUserById: ES.User.FnFindOneById
  es_updateInfo: ES.User.FnUpdateInfo

  fs_uploadProfilePicture: FS.User.FnUploadProfilePicture
  fs_findUserProfilePictureUrl: FS.User.FnFindProfilePictureUrl

  int_processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly name?: string
  readonly profilePicture?: RequestImage.Data
}
