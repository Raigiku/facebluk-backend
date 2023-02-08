import { ES } from '@facebluk/domain'
export * as Category from './category'
export * as Event from './event'
export * as FriendRequest from './friend-request'

export type EventTable = {
  readonly aggregate_id: string
  readonly aggregate_version: bigint
  readonly created_at: Date
  readonly published: boolean
} & ES.Event.AnyEventPayload

export const eventTableKey = (k: keyof EventTable) => k

export const initAggregateDataFromEventTable = (table: EventTable): ES.Aggregate.Data => ({
  id: table.aggregate_id,
  version: table.aggregate_version,
  createdAt: table.created_at,
})
