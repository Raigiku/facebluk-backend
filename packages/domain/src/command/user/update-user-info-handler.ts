import Joi from 'joi'
import { BusinessRuleError, Event, File, RequestImage, User, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  let profilePictureUrl: string | undefined = undefined
  if (req.profilePicture !== undefined) {
    const bucket = 'images'
    const filePath = `users/${req.userId}/${req.profilePicture.id}`
    await deps.uploadFile(bucket, filePath, req.profilePicture.bytes)
    profilePictureUrl = deps.findFileUrl(bucket, filePath)
  }

  const [, infoUpdatedEvent] = User.updateInfo(user, req.name, profilePictureUrl)

  await deps.updateUserInfo(infoUpdatedEvent)
  await deps.publishEvent(req.id, infoUpdatedEvent)
}

export type Dependencies = {
  findUserById: User.FnFindOneById
  updateUserInfo: User.FnUpdateInfo
  uploadFile: File.FnUpload
  findFileUrl: File.FnFindFileUrl
  publishEvent: Event.FnPublishEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly name?: string
  readonly profilePicture?: RequestImage
}
