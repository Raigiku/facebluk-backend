import Joi from 'joi'
import { BusinessRuleError, EventData, RequestImage, User, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  await validator.validateAsync(req)

  if (req.name === undefined && req.profilePicture === undefined)
    throw new BusinessRuleError(req.id, '"name" and "profilePicture" are both undefined')

  const user = await deps.findUserById(req.userId)
  if (user === undefined) throw new BusinessRuleError(req.id, 'user does not exist')

  let profilePictureUrl: string | undefined = undefined
  if (req.profilePicture !== undefined) {
    await deps.uploadProfilePicture(req.userId, req.profilePicture.bytes)
    profilePictureUrl = deps.findProfilePictureUrl(req.userId)
  }

  const [, infoUpdatedEvent] = User.updateInfo(user, req.name, profilePictureUrl)

  await deps.updateUserInfo(infoUpdatedEvent)
  await deps.publishEvent(req.id, infoUpdatedEvent)
}

export type Dependencies = {
  findUserById: User.FnFindOneById
  updateUserInfo: User.FnUpdateInfo
  uploadProfilePicture: User.FnUploadProfilePicture
  findProfilePictureUrl: User.FnFindProfilePictureUrl
  publishEvent: EventData.FnPublishEvent
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
  name: User.nameValidator,
  profilePicture: RequestImage.validator,
})
