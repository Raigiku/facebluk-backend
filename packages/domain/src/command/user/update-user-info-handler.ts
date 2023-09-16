import Joi from 'joi'
import { BusinessRuleError, Event, File, RequestImage, User } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  let profilePictureUrl: string | undefined = undefined
  if (req.profilePicture !== undefined) {
    const bucket = 'images'
    const filePath = `users/${req.user.aggregate.id}/${req.profilePicture.id}`
    await deps.uploadFile(bucket, filePath, req.profilePicture.bytes)
    profilePictureUrl = deps.findFileUrl(bucket, filePath)
  }

  const infoUpdatedEvent = User.updateInfo(req.user, req.name, profilePictureUrl)

  await deps.updateUserInfo(infoUpdatedEvent)
  await deps.publishEvent(req.requestId, infoUpdatedEvent)
}

export type Dependencies = {
  updateUserInfo: User.FnUpdateInfo
  uploadFile: File.FnUpload
  findFileUrl: File.FnFindFileUrl
  publishEvent: Event.FnPublishEvent
}

export type Request = {
  readonly requestId: string
  readonly user: User.Aggregate
  readonly name?: string
  readonly profilePicture?: RequestImage
}

export const id = 'update-user-info'

export const validate = async (
  requestId: string,
  payload: ValidatePayload,
  deps: ValidateDeps
): Promise<ValidateResponse> => {
  await syntaxValidator.validateAsync(payload)

  if (payload.name === undefined && payload.profilePicture === undefined)
    throw new BusinessRuleError(requestId, '"name" and "profilePicture" are both undefined')

  const user = await deps.findUserById(payload.userId)
  if (user === undefined) throw new BusinessRuleError(requestId, 'user does not exist')

  return { user }
}

type ValidatePayload = {
  readonly name?: string
  readonly profilePicture?: RequestImage
  readonly userId: string
}

type ValidateDeps = {
  findUserById: User.FnFindOneById
}

type ValidateResponse = {
  user: User.Aggregate
}

const syntaxValidator = Joi.object({
  name: User.nameValidator,
  profilePicture: RequestImage.validator,
})
