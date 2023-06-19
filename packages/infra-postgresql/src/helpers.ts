import { Pool } from 'pg'
import { FriendRequest, Post, User, UserRelationship } from './accessor'

export const truncateTables = async (pool: Pool) => {
  await pool.query(`
    TRUNCATE TABLE 
      ${User.eventTableName}, 
      ${User.userTableName}, 
      ${Post.eventTableName}, 
      ${Post.postTableName}, 
      ${FriendRequest.eventTableName}, 
      ${FriendRequest.friendRequestTableName}, 
      ${UserRelationship.eventTableName},
      ${UserRelationship.userRelationshipTableName}
  `)
}
