import { Uuid } from '.'

export type AggregateData = {
  readonly id: string
  readonly version: bigint
  readonly createdAt: Date
}

const create = (): AggregateData => ({
  id: Uuid.create(),
  version: 1n,
  createdAt: new Date(),
})

const createWithId = (id: string): AggregateData => ({
  id,
  version: 1n,
  createdAt: new Date(),
})

const increaseVersion = (data: AggregateData): AggregateData => ({
  ...data,
  version: data.version + 1n,
})

export const AggregateData = {
  create,
  createWithId,
  increaseVersion,
}
