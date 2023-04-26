import { Pool } from 'pg'
import { FriendRequest, Post, User, UserRelationship } from './accessor'

export const truncateTables = async (pool: Pool) => {
  await pool.query(`
    TRUNCATE TABLE ${User.tableName}, ${Post.tableName}, ${FriendRequest.tableName}, ${UserRelationship.tableName}
  `)
}
