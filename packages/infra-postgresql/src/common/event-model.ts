import { ES } from "@facebluk/domain"

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
