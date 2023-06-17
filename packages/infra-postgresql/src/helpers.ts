import { Pool } from 'pg'
import { FriendRequest, Post, User, UserRelationship } from './accessor'

export const truncateTables = async (pool: Pool) => {
  await pool.query(`
    TRUNCATE TABLE ${User.eventTableName}, ${Post.eventTableName}, ${FriendRequest.eventTableName}, ${UserRelationship.tableName}
  `)
}
