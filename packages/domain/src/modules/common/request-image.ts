import Joi from 'joi'
import { Uuid } from '.'

export type RequestImage = {
  readonly id: string
  readonly bytes: Buffer
  readonly fileType: string
}

const create = (bytes: Buffer, fileType: string): RequestImage => ({
  id: Uuid.create(),
  bytes,
  fileType,
})

const tenMegaByteInBytes = 10 * 1024 * 1024 // 10 MB
const allowedExtensions = ['image/png', 'image/jpg', 'image/jpeg']
const validator = Joi.object({
  id: Joi.string().uuid().required(),
  bytes: Joi.binary()
    .max(tenMegaByteInBytes)
    .required()
    .messages({ 'binary.max': '"bytes" must be less than or equal to 10 MB' }),
  fileType: Joi.string()
    .valid(...allowedExtensions)
    .required(),
})

export const RequestImage = {
  create,
  validator,
}
