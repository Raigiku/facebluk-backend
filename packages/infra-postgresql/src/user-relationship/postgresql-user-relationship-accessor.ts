import { ES } from '@facebluk/domain'
import { Pool } from 'pg'
import { EventTable, eventTableKey, initAggregateDataFromEventTable } from '../common'

export const tableName = 'user_relationship_event'

export const getBetweenUsers =
  (pool: Pool): ES.UserRelationship.FnGetBetweenUsers =>
  async (userAId: string, userBId: string) => {
    const { rows } = await pool.query(
      `
        select *
        from ${tableName} ure 
        where (
            ure.${eventTableKey('payload')}->>'fromUserId' = $1 and
            ure.${eventTableKey('payload')}->>'toUserId' = $2
          ) or
          (
            ure.${eventTableKey('payload')}->>'toUserId' = $1 and
            ure.${eventTableKey('payload')}->>'fromUserId' = $2
          )
        order by ure.${eventTableKey('created_at')} asc
      `,
      [userAId, userBId]
    )
    const userRelationshipHelper: ES.UserRelationship.Aggregate[] = []
    for (const row of rows) parseRowToAggregate(userRelationshipHelper, row as EventTable)
    return userRelationshipHelper[0]
  }

const parseRowToAggregate = (
  userRelationshipHelper: ES.UserRelationship.Aggregate[],
  event: EventTable
) => {
  if (event.payload.tag === 'user-relationship-friended') {
    if (userRelationshipHelper.length === 0)
      userRelationshipHelper.push({
        aggregate: initAggregateDataFromEventTable(event),
        friendStatus: {
          tag: 'friended',
          fromUserId: event.payload.fromUserId,
          toUserId: event.payload.toUserId,
          friendedAt: event.created_at,
        },
        blockedStatus: { tag: 'not-blocked' },
      })
    else
      userRelationshipHelper[0] = {
        ...userRelationshipHelper[0],
        aggregate: { ...userRelationshipHelper[0].aggregate, version: event.aggregate_version },
        friendStatus: {
          tag: 'friended',
          fromUserId: event.payload.fromUserId,
          toUserId: event.payload.toUserId,
          friendedAt: event.created_at,
        },
      }
  } else if (event.payload.tag === 'user-relationship-blocked') {
    if (userRelationshipHelper.length === 0)
      userRelationshipHelper.push({
        aggregate: initAggregateDataFromEventTable(event),
        blockedStatus: {
          tag: 'blocked',
          fromUserId: event.payload.fromUserId,
          toUserId: event.payload.toUserId,
          blockedAt: event.created_at,
        },
        friendStatus: { tag: 'not-friended' },
      })
    else
      userRelationshipHelper[0] = {
        ...userRelationshipHelper[0],
        aggregate: { ...userRelationshipHelper[0].aggregate, version: event.aggregate_version },
        blockedStatus: {
          tag: 'blocked',
          fromUserId: event.payload.fromUserId,
          toUserId: event.payload.toUserId,
          blockedAt: event.created_at,
        },
      }
  } else if (event.payload.tag === 'user-relationship-unfriended')
    userRelationshipHelper[0] = {
      ...userRelationshipHelper[0],
      aggregate: { ...userRelationshipHelper[0].aggregate, version: event.aggregate_version },
      friendStatus: {
        tag: 'unfriended',
        fromUserId: event.payload.fromUserId,
        toUserId: event.payload.toUserId,
        unfriendedAt: event.created_at,
      },
    }
  else if (event.payload.tag === 'user-relationship-unblocked')
    userRelationshipHelper[0] = {
      ...userRelationshipHelper[0],
      aggregate: { ...userRelationshipHelper[0].aggregate, version: event.aggregate_version },
      blockedStatus: {
        tag: 'unblocked',
        fromUserId: event.payload.fromUserId,
        toUserId: event.payload.toUserId,
        unblockedAt: event.created_at,
      },
    }
  else throw new Error('invalid event')
}
