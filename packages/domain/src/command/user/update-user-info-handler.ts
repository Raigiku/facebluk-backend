import Joi from 'joi'
import { BusinessRuleError, ES, FS, INT, RequestImage, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  await validator.validateAsync(req)

  if (req.name === undefined && req.profilePicture === undefined)
    throw new BusinessRuleError(req.id, '"name" and "profilePicture" are both undefined')

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

export const validator = Joi.object<Request, true>({
  id: Uuid.validator.required(),
  userId: Uuid.validator.required(),
  name: ES.User.nameValidator,
  profilePicture: RequestImage.validator,
})
