import { Event, FriendRequest, Post, User, UserRelationship } from '@facebluk/domain'
import { Pool } from 'pg'
import {
  User as UserInfra,
  Post as PostInfra,
  UserRelationship as UserRelationshipInfra,
  FriendRequest as FriendRequestInfra,
  Event as EventInfra
} from '..'
import { EventTable } from './index'

export const findEvent =
  (pool: Pool): Event.DbQueries.FindEvent =>
    async (eventId: string, eventTag: Event.AnyEventTag) => {
      if (eventTag === 'user-registered') {
        const { rows } = await pool.query<EventTable>(
          `
        SELECT *
        FROM ${UserInfra.PostgreSQL.eventTableName} e
        WHERE e.${EventInfra.eventTableKey('event_id')} = $1
        `,
          [eventId]
        )
        if (rows.length === 0) return undefined
        const row = rows[0]
        if (row.payload.tag === 'user-registered')
          return {
            data: {
              aggregateId: row.aggregate_id,
              createdAt: row.created_at,
              eventId: row.event_id,
              published: row.published,
            },
            payload: {
              tag: 'user-registered',
              alias: row.payload.alias,
              name: row.payload.name,
              profilePictureUrl: row.payload.profilePictureUrl,
            },
          } as User.RegisteredEvent
      } else if (eventTag === 'user-info-updated') {
        const { rows } = await pool.query<EventTable>(
          `
        SELECT *
        FROM ${UserInfra.PostgreSQL.eventTableName} e
        WHERE e.${EventInfra.eventTableKey('event_id')} = $1
        `,
          [eventId]
        )
        if (rows.length === 0) return undefined
        const row = rows[0]
        if (row.payload.tag === 'user-info-updated')
          return {
            data: {
              aggregateId: row.aggregate_id,
              createdAt: row.created_at,
              eventId: row.event_id,
              published: row.published,
            },
            payload: {
              tag: 'user-info-updated',
              name: row.payload.name,
              profilePictureUrl: row.payload.profilePictureUrl,
            },
          } as User.InfoUpdatedEvent
      } else if (eventTag === 'post-created') {
        const { rows } = await pool.query<EventTable>(
          `
        SELECT *
        FROM ${PostInfra.PostgreSQL.eventTableName} e
        WHERE e.${EventInfra.eventTableKey('event_id')} = $1
        `,
          [eventId]
        )
        if (rows.length === 0) return undefined
        const row = rows[0]
        if (row.payload.tag === 'post-created')
          return {
            data: {
              aggregateId: row.aggregate_id,
              createdAt: row.created_at,
              eventId: row.event_id,
              published: row.published,
            },
            payload: {
              tag: 'post-created',
              description: row.payload.description,
              taggedUserIds: row.payload.taggedUserIds,
              userId: row.payload.userId,
            },
          } as Post.CreatedEvent
      } else if (eventTag === 'friend-request-sent') {
        const { rows } = await pool.query<EventTable>(
          `
        SELECT *
        FROM ${FriendRequestInfra.PostgreSQL.eventTableName} e
        WHERE e.${EventInfra.eventTableKey('event_id')} = $1
        `,
          [eventId]
        )
        if (rows.length === 0) return undefined
        const row = rows[0]
        if (row.payload.tag === 'friend-request-sent')
          return {
            data: {
              aggregateId: row.aggregate_id,
              createdAt: row.created_at,
              eventId: row.event_id,
              published: row.published,
            },
            payload: {
              tag: 'friend-request-sent',
              fromUserId: row.payload.fromUserId,
              toUserId: row.payload.toUserId,
            },
          } as FriendRequest.SentEvent
      } else if (eventTag === 'friend-request-accepted') {
        const { rows } = await pool.query<EventTable>(
          `
        SELECT *
        FROM ${FriendRequestInfra.PostgreSQL.eventTableName} e
        WHERE e.${EventInfra.eventTableKey('event_id')} = $1
        `,
          [eventId]
        )
        if (rows.length === 0) return undefined
        const row = rows[0]
        if (row.payload.tag === 'friend-request-accepted')
          return {
            data: {
              aggregateId: row.aggregate_id,
              createdAt: row.created_at,
              eventId: row.event_id,
              published: row.published,
            },
            payload: {
              tag: 'friend-request-accepted',
            },
          } as FriendRequest.AcceptedEvent
      } else if (eventTag === 'friend-request-cancelled') {
        const { rows } = await pool.query<EventTable>(
          `
        SELECT *
        FROM ${FriendRequestInfra.PostgreSQL.eventTableName} e
        WHERE e.${EventInfra.eventTableKey('event_id')} = $1
        `,
          [eventId]
        )
        if (rows.length === 0) return undefined
        const row = rows[0]
        if (row.payload.tag === 'friend-request-cancelled')
          return {
            data: {
              aggregateId: row.aggregate_id,
              createdAt: row.created_at,
              eventId: row.event_id,
              published: row.published,
            },
            payload: {
              tag: 'friend-request-cancelled',
            },
          } as FriendRequest.CancelledEvent
      } else if (eventTag === 'friend-request-rejected') {
        const { rows } = await pool.query<EventTable>(
          `
        SELECT *
        FROM ${FriendRequestInfra.PostgreSQL.eventTableName} e
        WHERE e.${EventInfra.eventTableKey('event_id')} = $1
        `,
          [eventId]
        )
        if (rows.length === 0) return undefined
        const row = rows[0]
        if (row.payload.tag === 'friend-request-rejected')
          return {
            data: {
              aggregateId: row.aggregate_id,
              createdAt: row.created_at,
              eventId: row.event_id,
              published: row.published,
            },
            payload: {
              tag: 'friend-request-rejected',
            },
          } as FriendRequest.RejectedEvent
      } else if (eventTag === 'user-relationship-friended') {
        const { rows } = await pool.query<EventTable>(
          `
        SELECT *
        FROM ${UserRelationshipInfra.PostgreSQL.eventTableName} e
        WHERE e.${EventInfra.eventTableKey('event_id')} = $1
        `,
          [eventId]
        )
        if (rows.length === 0) return undefined
        const row = rows[0]
        if (row.payload.tag === 'user-relationship-friended')
          return {
            data: {
              aggregateId: row.aggregate_id,
              createdAt: row.created_at,
              eventId: row.event_id,
              published: row.published,
            },
            payload: {
              tag: 'user-relationship-friended',
              fromUserId: row.payload.fromUserId,
              toUserId: row.payload.toUserId,
            },
          } as UserRelationship.FriendedUserEvent
      } else if (eventTag === 'user-relationship-unfriended') {
        const { rows } = await pool.query<EventTable>(
          `
        SELECT *
        FROM ${UserRelationshipInfra.PostgreSQL.eventTableName} e
        WHERE e.${EventInfra.eventTableKey('event_id')} = $1
        `,
          [eventId]
        )
        if (rows.length === 0) return undefined
        const row = rows[0]
        if (row.payload.tag === 'user-relationship-unfriended')
          return {
            data: {
              aggregateId: row.aggregate_id,
              createdAt: row.created_at,
              eventId: row.event_id,
              published: row.published,
            },
            payload: {
              tag: 'user-relationship-unfriended',
              fromUserId: row.payload.fromUserId,
              toUserId: row.payload.toUserId,
            },
          } as UserRelationship.UnfriendedUserEvent
      } else if (eventTag === 'user-relationship-blocked') {
        const { rows } = await pool.query<EventTable>(
          `
        SELECT *
        FROM ${UserRelationshipInfra.PostgreSQL.eventTableName} e
        WHERE e.${EventInfra.eventTableKey('event_id')} = $1
        `,
          [eventId]
        )
        if (rows.length === 0) return undefined
        const row = rows[0]
        if (row.payload.tag === 'user-relationship-blocked')
          return {
            data: {
              aggregateId: row.aggregate_id,
              createdAt: row.created_at,
              eventId: row.event_id,
              published: row.published,
            },
            payload: {
              tag: 'user-relationship-blocked',
              fromUserId: row.payload.fromUserId,
              toUserId: row.payload.toUserId,
            },
          } as UserRelationship.BlockedUserEvent
      } else if (eventTag === 'user-relationship-unblocked') {
        const { rows } = await pool.query<EventTable>(
          `
        SELECT *
        FROM ${UserRelationshipInfra.PostgreSQL.eventTableName} e
        WHERE e.${EventInfra.eventTableKey('event_id')} = $1
        `,
          [eventId]
        )
        if (rows.length === 0) return undefined
        const row = rows[0]
        if (row.payload.tag === 'user-relationship-unblocked')
          return {
            data: {
              aggregateId: row.aggregate_id,
              createdAt: row.created_at,
              eventId: row.event_id,
              published: row.published,
            },
            payload: {
              tag: 'user-relationship-unblocked',
              fromUserId: row.payload.fromUserId,
              toUserId: row.payload.toUserId,
            },
          } as UserRelationship.UnblockedUserEvent
      }
      return undefined
    }
