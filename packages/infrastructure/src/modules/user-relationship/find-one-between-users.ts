import { UserRelationship } from '@facebluk/domain'
import { Pool } from 'pg'
import {
  userRelationshipTableKey,
  userRelationshipTableName,
  userRelationshipTableToAggregate,
} from '.'

export const findOneBetweenUsers =
  (pool: Pool): UserRelationship.FnFindOneBetweenUsers =>
  async (userAId: string, userBId: string) => {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM ${userRelationshipTableName} ur
      WHERE (
        ur.${userRelationshipTableKey('friend_from_user_id')} = $1
        AND ur.${userRelationshipTableKey('friend_to_user_id')} = $2
      ) OR (
        ur.${userRelationshipTableKey('friend_to_user_id')} = $1
        AND ur.${userRelationshipTableKey('friend_from_user_id')} = $2
      ) OR (
        ur.${userRelationshipTableKey('blocked_from_user_id')} = $1
        AND ur.${userRelationshipTableKey('blocked_to_user_id')} = $2
      ) OR (
        ur.${userRelationshipTableKey('blocked_to_user_id')} = $1
        AND ur.${userRelationshipTableKey('blocked_from_user_id')} = $2
      )
      `,
      [userAId, userBId]
    )
    if (rows.length === 0) return undefined
    return userRelationshipTableToAggregate(rows[0])
  }
