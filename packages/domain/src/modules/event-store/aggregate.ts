import { Uuid } from '../common'

export type Data = {
  readonly id: string
  readonly version: bigint
  readonly createdAt: Date
}

export const create = (): Data => ({
  id: Uuid.create(),
  version: 1n,
  createdAt: new Date(),
})

export const createWithId = (id: string): Data => ({
  id,
  version: 1n,
  createdAt: new Date(),
})

export const increaseVersion = (data: Data): Data => ({
  ...data,
  version: data.version + 1n,
})