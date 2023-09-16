import { Event, File, RequestImage, User } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  let profilePictureUrl: string | undefined = undefined
  if (req.profilePicture !== undefined) {
    const bucket = 'images'
    const filePath = `users/${req.userAuthMetadata.id}/${req.profilePicture.id}`
    await deps.uploadFile(bucket, filePath, req.profilePicture.bytes)
    profilePictureUrl = deps.findFileUrl(bucket, filePath)
  }

  let user = await deps.findUserById(req.userAuthMetadata.id)
  if (user === undefined) {
    const [newUser, registeredUserEvent] = User.register(
      req.userAuthMetadata.id,
      req.name,
      req.alias,
      profilePictureUrl
    )
    user = newUser
    await deps.registerUser(registeredUserEvent)
    await deps.publishEvent(req.requestId, registeredUserEvent)
  }

  if (!User.isRegistered(req.userAuthMetadata))
    await deps.markUserAsRegistered(req.userAuthMetadata.id, user.aggregate.createdAt)
}

export type Dependencies = {
  findUserById: User.FnFindOneById
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