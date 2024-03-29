import Joi from 'joi'
import * as uuid from 'uuid'

export namespace Uuid {
  export const create = () => uuid.v4()

  export const validator = Joi.string().guid()
}
