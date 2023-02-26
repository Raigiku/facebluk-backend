import { ES } from '@facebluk/domain'
import { Pool } from 'pg'
import { EventTable, eventTableKey } from '.'

export const TABLE_NAME = 'user_relationship_event'

export const getBetweenUsers =
  (pool: Pool): ES.UserRelationship.FnGetBetweenUsers =>
  async (userAId: string, userBId: string) => {
    const { rows } = await pool.query(
      `
        select *
        from ${TABLE_NAME} ure 
        where (ure.${eventTableKey('payload')}->>'fromUserId' = $1 and
          ure.${eventTableKey('payload')}->>'toUserId' = $2) or
          (ure.${eventTableKey('payload')}->>'toUserId' = $1 and
          ure.${eventTableKey('payload')}->>'fromUserId' = $2)
        order by ure.${eventTableKey('created_at')} asc
      `,
      [userAId, userBId]
    )
    const userRelationshipHelper: ES.UserRelationship.Aggregate[] = []
    for (const row of rows) parseRowToAggregate(userRelationshipHelper, row as EventTable)
    return userRelationshipHelper[0]
  }

export const parseRowToAggregate = (userRelationshipHelper: ES.UserRelationship.Aggregate[], event: EventTable) => {
  if (event.payload.tag === 'user-relationship-unfriended')
    userRelationshipHelper.push({
      tag: 'unfriend-aggregate',
      unfriendedAt: event.created_at,
    } as ES.UserRelationship.UnfriendAggregate)
  else if (event.payload.tag === 'user-relationship-blocked')
    userRelationshipHelper[0] = {
      tag: 'block-aggregate',
      blockedAt: event.created_at,
    } as ES.UserRelationship.BlockAggregate
  else throw new Error('invalid event')
}
