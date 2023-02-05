import { ES } from '@facebluk/domain'
export * as Category from './category'
export * as Event from './event'

export type EventTable<T> = {
  readonly aggregate_id: string
  readonly aggregate_version: bigint
  readonly created_at: Date
  readonly published: boolean
  readonly data: T
}

export const eventTableKey = <T>(k: keyof EventTable<T>) => k

export const aggregateDataFromEventTable = <T>(table: EventTable<T>): ES.Aggregate.Data => ({
  id: table.aggregate_id,
  version: table.aggregate_version,
})
