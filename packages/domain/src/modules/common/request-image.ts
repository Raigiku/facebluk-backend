import { BusinessRuleError } from './business-rule-error'

export type Data = {
  readonly bytes: Buffer
  readonly fileType: string
}

export const create = (bytes: Buffer, fileType: string): Data => ({
  bytes,
  fileType,
})

export const validate = (requestId: string, image: Data) => {
  const allowedExtensions = ['image/png', 'image/jpg', 'image/jpeg']
  if (!allowedExtensions.includes(image.fileType))
    throw new BusinessRuleError(requestId, `only allowed ${allowedExtensions.join(' ')} images`)
}
