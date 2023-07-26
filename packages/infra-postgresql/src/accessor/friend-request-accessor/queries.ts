import { ES } from '@facebluk/domain'
import { Pool } from 'pg'
import {
  eventTableName,
  friendRequestTableKey,
  friendRequestTableName,
  friendRequestTableToAggregate,
} from '.'
import { EventTable, eventTableKey } from '../../common'

export const findOneById =
  (pool: Pool): ES.FriendRequest.FnFindOneById =>
  async (id: string) => {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM ${friendRequestTableName} fr
      WHERE fr.${friendRequestTableKey('id')} = $1
      `,
      [id]
    )
    if (rows.length === 0) return undefined
    return friendRequestTableToAggregate(rows[0])
  }

export const findOneLastFriendRequestBetweenUsers =
  (pool: Pool): ES.FriendRequest.FnFindOneLastBetweenUsers =>
  async (userAId: string, userBId: string) => {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM ${friendRequestTableName} fr
      WHERE (
          fr.${friendRequestTableKey('from_user_id')} = $1 
          AND fr.${friendRequestTableKey('to_user_id')} = $2
        ) OR (
          fr.${friendRequestTableKey('to_user_id')} = $1
          AND fr.${friendRequestTableKey('from_user_id')} = $2
        )
      ORDER BY fr.${friendRequestTableKey('created_at')} DESC
      LIMIT 1
      `,
      [userAId, userBId]
    )
    if (rows.length === 0) return undefined
    return friendRequestTableToAggregate(rows[0])
  }

export const findManyEventsInOrder = async (pool: Pool) => {
  const { rows } = await pool.query<EventTable>(
    `
      SELECT *
      FROM ${eventTableName} e
      ORDER BY e.${eventTableKey('created_at')} ASC
    `
  )
  return rows
}
