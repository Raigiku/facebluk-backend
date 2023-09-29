import { Uuid } from '.'

export type AggregateData = {
  readonly id: string
  readonly createdAt: Date
}

const create = (): AggregateData => ({
  id: Uuid.create(),
  createdAt: new Date(),
})

const createWithId = (id: string): AggregateData => ({
  id,
  createdAt: new Date(),
})

export const AggregateData = {
  create,
  createWithId
}
