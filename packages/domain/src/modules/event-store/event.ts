import { ES } from '..'

export type Data = {
  readonly aggregateId: string
  readonly aggregateVersion: bigint
  readonly createdAt: Date
  readonly published: boolean
}

export const newA = (aggregate: ES.Aggregate.Data): Data => ({
  aggregateId: aggregate.id,
  aggregateVersion: aggregate.version,
  createdAt: new Date(),
  published: false,
})

export type AnyEvent = ES.Post.Event | ES.Category.Event
export type FnPersistEvent = (event: AnyEvent) => Promise<void>
export type FnMarkEventAsSent = (event: AnyEvent) => Promise<void>
