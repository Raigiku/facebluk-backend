import Joi from 'joi'
import crypto from 'crypto'

export type RequestImage = {
  readonly hash: string
  readonly bytes: Buffer
  readonly fileType: string
}

export namespace RequestImage {
  export const create = (bytes: Buffer, fileType: string): RequestImage => {
    const cryptoGen = crypto.createHash('sha256')
    cryptoGen.update(bytes)
    const hash = cryptoGen.digest('hex')
    return {
      hash,
      bytes,
      fileType,
    }
  }

  export const fileExtension = (fileType: string): string => {
    const temp = fileType.split('/')
    return temp[temp.length - 1]
  }

  const tenMegaByteInBytes = 10 * 1024 * 1024 // 10 MB
  const allowedExtensions = ['image/png', 'image/jpg', 'image/jpeg']
  export const validator = Joi.object({
    id: Joi.string().uuid().required(),
    bytes: Joi.binary()
      .max(tenMegaByteInBytes)
      .required()
      .messages({ 'binary.max': '"bytes" must be less than or equal to 10 MB' }),
    fileType: Joi.string()
      .valid(...allowedExtensions)
      .required(),
  })
}
