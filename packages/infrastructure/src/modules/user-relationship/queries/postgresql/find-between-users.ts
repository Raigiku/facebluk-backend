import { UserRelationship } from '@facebluk/domain'
import { Pool } from 'pg'
import {
  PostgreSQL as UserRelationshipInfra
} from '../..'

export const findBetweenUsers =
  (pool: Pool): UserRelationship.DbQueries.FindBetweenUsers =>
  async (userAId: string, userBId: string) => {
    const { rows } = await pool.query(
      `
      SELECT *
      FROM ${UserRelationshipInfra.userRelationshipTableName} ur
      WHERE (
        ur.${UserRelationshipInfra.userRelationshipTableKey('friend_from_user_id')} = $1
        AND ur.${UserRelationshipInfra.userRelationshipTableKey('friend_to_user_id')} = $2
      ) OR (
        ur.${UserRelationshipInfra.userRelationshipTableKey('friend_to_user_id')} = $1
        AND ur.${UserRelationshipInfra.userRelationshipTableKey('friend_from_user_id')} = $2
      )
      `,
      [userAId, userBId]
    )
    if (rows.length === 0) return undefined
    return UserRelationshipInfra.userRelationshipTableToAggregate(rows[0])
  }
