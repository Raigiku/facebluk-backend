import * as uuid from 'uuid'
import { BusinessRuleError } from './business-rule-error'

export const newA = () => uuid.v4()

export const validate = (requestId: string, v: string, label: string) => {
  if (v.length === 0 || !uuid.validate(v)) throw notValidFormatError(requestId, label)
}

export const notValidFormatError = (requestId: string, label: string) =>
  new BusinessRuleError(requestId, `${label} not a valid format for uuid`)
