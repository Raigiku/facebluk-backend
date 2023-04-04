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
    const friendRequestHelper: ES.FriendRequest.Aggregate[] = []
    for (const row of rows) parseRowToAggregate(friendRequestHelper, row as EventTable)
    return friendRequestHelper[0]
  }

export const getLastFriendRequestBetweenUsers =
  (pool: Pool): ES.FriendRequest.FnGetLastBetweenUsers =>
  async (fromUserId: string, toUserId: string) => {
    const { rows } = await pool.query(
      `
        select *
        from (
          select fre.${eventTableKey('aggregate_id')} 
          from ${TABLE_NAME} fre 
          where fre.${eventTableKey('aggregate_version')} = 1 and 
            (
              fre.${eventTableKey('payload')}->>'toUserId' = $1 and 
              fre.${eventTableKey('payload')}->>'fromUserId' = $2
            ) or
            (
              fre.${eventTableKey('payload')}->>'toUserId' = $2 and
              fre.${eventTableKey('payload')}->>'fromUserId' = $1
            )
          order by fre.${eventTableKey('created_at')} desc
          limit 1
        ) a
        join ${TABLE_NAME} fre2 
          on fre2.${eventTableKey('aggregate_id')} = a.${eventTableKey('aggregate_id')}
        order by fre2.${eventTableKey('created_at')} asc
      `,
      [toUserId, fromUserId]
    )
    const friendRequestHelper: ES.FriendRequest.Aggregate[] = []
    for (const row of rows) parseRowToAggregate(friendRequestHelper, row as EventTable)
    return friendRequestHelper[0]
  }

const parseRowToAggregate = (
  friendRequestHelper: ES.FriendRequest.Aggregate[],
  event: EventTable
) => {
  if (event.payload.tag === 'friend-request-sent')
    friendRequestHelper.push({
      aggregate: initAggregateDataFromEventTable(event),
      fromUserId: event.payload.fromUserId,
      toUserId: event.payload.toUserId,
      status: { tag: 'pending' },
    })
  else if (event.payload.tag === 'friend-request-accepted')
    friendRequestHelper[0] = {
      ...friendRequestHelper[0],
      aggregate: { ...friendRequestHelper[0].aggregate, version: event.aggregate_version },
      status: { tag: 'accepted', acceptedAt: event.created_at },
    }
  else if (event.payload.tag === 'friend-request-rejected')
    friendRequestHelper[0] = {
      ...friendRequestHelper[0],
      aggregate: { ...friendRequestHelper[0].aggregate, version: event.aggregate_version },
      status: { tag: 'rejected', rejectedAt: event.created_at },
    }
  else if (event.payload.tag === 'friend-request-cancelled')
    friendRequestHelper[0] = {
      ...friendRequestHelper[0],
      aggregate: { ...friendRequestHelper[0].aggregate, version: event.aggregate_version },
      status: { tag: 'cancelled', cancelledAt: event.created_at },
    }
  else throw new Error('invalid event')
}
