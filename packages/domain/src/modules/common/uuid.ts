import * as uuid from 'uuid'
import { BusinessRuleError } from './business-rule-error'

export const newA = () => uuid.v4()

export const validate = (requestId: string, v: string) => {
  if (v.length === 0 || !uuid.validate(v)) throw notValidFormatError(requestId)
}

export const notValidFormatError = (requestId: string) =>
  new BusinessRuleError(requestId, 'not a valid format for uuid')
