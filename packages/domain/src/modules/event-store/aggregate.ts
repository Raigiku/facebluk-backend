import { BusinessRuleError, Uuid } from '../common'

export type Data = {
  readonly id: string
  readonly version: bigint
}

export const newA = (requestId: string, validate: FnValidate): Data =>
  validate(requestId, {
    id: Uuid.newA(),
    version: 1n,
  })

export const increaseVersion = (requestId: string, data: Data, validate: FnValidate): Data =>
  validate(requestId, {
    ...data,
    version: data.version + 1n,
  })

// validation
export type FnValidate = (requestId: string, data: Data) => Data

export const validate = (requestId: string, data: Data): Data => {
  Uuid.validate(requestId, data.id)
  if (data.version <= 0) throw versionNotPositiveError(requestId)
  return data
}

export const versionNotPositiveError = (requestId: string) =>
  new BusinessRuleError(requestId, 'aggregate version must be positive')
