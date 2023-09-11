export * from './publish-event'
export * from './publish-events'
export * from './register-event'

import { EventData } from '@facebluk/domain'
import { FriendRequest, Post, User, UserRelationship } from '..'

export type EventTable = {
  readonly aggregate_id: string
  readonly aggregate_version: bigint
  readonly created_at: Date
  readonly published: boolean
} & EventData.AnyEventPayload
export const eventTableKey = (k: keyof EventTable) => k
export const determineTableName = (event: EventData.AnyEvent) =>
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
