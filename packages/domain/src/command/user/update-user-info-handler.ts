import { BusinessRuleError, ES, FS, INT, RequestImage, UA, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  validateInputFields(req)

  const user = await deps.findUserById(req.userId)
  if (user === undefined) throw new BusinessRuleError(req.id, 'user does not exist')

  let profilePictureUrl: string | undefined = undefined
  if (req.profilePicture !== undefined) {
    await deps.uploadProfilePicture(req.userId, req.profilePicture.bytes)
    profilePictureUrl = deps.findUserProfilePictureUrl(req.userId)
  }


  // ES.User.updateInfo()
}

const validateInputFields = (req: Request) => {
  Uuid.validate(req.id, req.userId, 'userId')
  if (req.name !== undefined) ES.User.validateName(req.id, req.name)
  if (req.profilePicture !== undefined) RequestImage.validate(req.id, req.profilePicture)
}

export type Dependencies = {
  uploadProfilePicture: FS.User.FnUploadProfilePicture
  findUserProfilePictureUrl: FS.User.FnFindProfilePictureUrl
  
  findUserById: UA.User.FnFindOneById

  processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  readonly id: string
  readonly userId: string
  readonly name?: string
  readonly profilePicture?: RequestImage.Data
}
