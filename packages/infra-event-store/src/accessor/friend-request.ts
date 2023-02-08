import { ES } from '@facebluk/domain'
import { Pool } from 'pg'
import { EventTable, eventTableKey, initAggregateDataFromEventTable } from '.'

export const TABLE_NAME = 'friend_request_event'

export const get =
  (pool: Pool): ES.FriendRequest.FnGet =>
  async (id: string) => {
    const { rows } = await pool.query(
      `
        SELECT *
        FROM ${TABLE_NAME} e
        WHERE e.${eventTableKey('aggregate_id')} = $1
        ORDER BY e.${eventTableKey('aggregate_version')} ASC
      `,
      [id]
    )
    let friendRequest: ES.FriendRequest.Aggregate | undefined = undefined
    for (const row of rows) {
      const event = row as EventTable
      if (event.payload.tag === 'friend-request-sent')
        friendRequest = {
          data: initAggregateDataFromEventTable(event),
          fromUserId: event.payload.fromUserId,
          toUserId: event.payload.toUserId,
        } as ES.FriendRequest.DefaultAggregate
      else if (event.payload.tag === 'friend-request-accepted')
        friendRequest = {
          data: { ...friendRequest!.data, version: event.aggregate_version },
          acceptedAt: event.created_at,
        } as ES.FriendRequest.AcceptedAggregate
      else if (event.payload.tag === 'friend-request-rejected')
        friendRequest = {
          data: { ...friendRequest!.data, version: event.aggregate_version },
          rejectedAt: event.created_at,
        } as ES.FriendRequest.RejectedAggregate
      else if (event.payload.tag === 'friend-request-cancelled')
        friendRequest = {
          data: { ...friendRequest!.data, version: event.aggregate_version },
          cancelledAt: event.created_at,
        } as ES.FriendRequest.CancelledAggregate
      else throw new Error('invalid event')
      return friendRequest
    }
  }
