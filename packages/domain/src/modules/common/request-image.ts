import Joi from 'joi'

export type Data = {
  readonly bytes: Buffer
  readonly fileType: string
}

export const create = (bytes: Buffer, fileType: string): Data => ({
  bytes,
  fileType,
})

const tenMegaByteInBytes = 10 * 1024 * 1024 // 10 MB
const allowedExtensions = ['image/png', 'image/jpg', 'image/jpeg']
export const validator = Joi.object({
  bytes: Joi.binary()
    .max(tenMegaByteInBytes)
    .required()
    .messages({ 'binary.max': '"bytes" must be less than or equal to 10 MB' }),
  fileType: Joi.string()
    .valid(...allowedExtensions)
    .required(),
})
