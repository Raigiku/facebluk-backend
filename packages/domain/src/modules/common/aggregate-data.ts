import { Uuid } from "./uuid"

export type AggregateData = {
  readonly id: string
  readonly createdAt: Date
}

export namespace AggregateData {
  export const create = (): AggregateData => ({
    id: Uuid.create(),
    createdAt: new Date(),
  })

  export const createWithId = (id: string): AggregateData => ({
    id,
    createdAt: new Date(),
  })
}