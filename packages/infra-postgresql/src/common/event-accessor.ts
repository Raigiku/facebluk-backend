import { ES } from '@facebluk/domain'
import { PoolClient } from 'pg'
import { FriendRequest, Post, User, UserRelationship } from '../postgresql'
import { eventTableKey } from './event-model'

const determineTableName = (event: ES.Event.AnyEvent) =>
  event.payload.tag.includes('post')
    ? Post.eventTableName
    : event.payload.tag.includes('friend-request')
    ? FriendRequest.eventTableName
    : event.payload.tag.includes('user-relationship')
    ? UserRelationship.eventTableName
    : event.payload.tag.includes('user')
    ? User.eventTableName
    : (() => {
        throw new Error('undefined table')
      })()

export const markEventAsSent =
  (pgClient: PoolClient): ES.Event.FnMarkEventAsSent =>
  async (event: ES.Event.AnyEvent) => {
    const tableName = determineTableName(event)
    await pgClient.query(
      `
      UPDATE ${tableName}
      SET ${eventTableKey('published')} = true
      WHERE ${eventTableKey('aggregate_id')} = $1 AND
        ${eventTableKey('aggregate_version')} = $2
    `,
      [event.data.aggregateId, event.data.aggregateVersion]
    )
  }

export const registerEvent = async (pgClient: PoolClient, tableName: string, event: ES.Event.AnyEvent) => {
  await pgClient.query(
    `
      INSERT INTO ${tableName} (
        ${eventTableKey('aggregate_id')},
        ${eventTableKey('aggregate_version')},
        ${eventTableKey('created_at')},
        ${eventTableKey('published')},
        ${eventTableKey('payload')}
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      event.data.aggregateId,
      event.data.aggregateVersion,
      event.data.createdAt,
      event.data.published,
      event.payload,
    ]
  )
}
