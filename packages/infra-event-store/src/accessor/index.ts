import { ES } from '@facebluk/domain'
export * as Event from './event-store-event-accessor'
export * as FriendRequest from './event-store-friend-request-accessor'
export * as Post from './event-store-post-accessor'
export * as User from './event-store-user-accessor'
export * as UserRelationship from './event-store-user-relationship-accessor'

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

export const initEventDataFromEventTable = (table: EventTable): ES.Event.Data => ({
  aggregateId: table.aggregate_id,
  aggregateVersion: table.aggregate_version,
  published: table.published,
  createdAt: table.created_at,
})
