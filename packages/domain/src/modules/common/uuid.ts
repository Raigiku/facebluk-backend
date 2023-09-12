import Joi from 'joi'
import * as uuid from 'uuid'

const create = () => uuid.v4()

const validator = Joi.string().guid()

export const Uuid = {
  create,
  validator,
}
