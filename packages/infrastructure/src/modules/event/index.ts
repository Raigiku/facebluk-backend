export * from './publish-event'
export * from './insert-event'
export * from './mark-event-as-published'
export * from './send-broker-msg'
export * from './find-event'

import { Event } from '@facebluk/domain'
import { FriendRequest, Post, User, UserRelationship } from '..'

export type EventTable = {
  readonly event_id: string
  readonly aggregate_id: string
  readonly created_at: Date
  readonly published: boolean
} & Event.AnyEventPayload

export const eventTableKey = (k: keyof EventTable) => k

export const determineTableName = (event: Event.AnyEvent) =>
  event.payload.tag.includes('post')
    ? Post.PostgreSQL.eventTableName
    : event.payload.tag.includes('friend-request')
    ? FriendRequest.PostgreSQL.eventTableName
    : event.payload.tag.includes('user-relationship')
    ? UserRelationship.PostgreSQL.eventTableName
    : event.payload.tag.includes('user')
    ? User.PostgreSQL.eventTableName
    : (() => {
        throw new Error('undefined table')
      })()
