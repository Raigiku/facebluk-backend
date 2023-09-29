import { AggregateData, FriendRequest, Post, User, UserRelationship } from '..'

export type Data = {
  readonly eventId: string
  readonly aggregateId: string
  readonly createdAt: Date
  readonly published: boolean
}

export const create = (eventId: string, aggregate: AggregateData): Data => ({
  eventId,
  aggregateId: aggregate.id,
  createdAt: aggregate.createdAt,
  published: false,
})

export type AnyEventPayload =
  | Pick<Post.Event, 'payload'>
  | Pick<User.Event, 'payload'>
  | Pick<FriendRequest.Event, 'payload'>
  | Pick<UserRelationship.Event, 'payload'>

export type AnyEvent = Post.Event | User.Event | FriendRequest.Event | UserRelationship.Event
