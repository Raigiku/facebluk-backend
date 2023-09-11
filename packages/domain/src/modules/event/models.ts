import { AggregateData, FriendRequest, Post, User, UserRelationship } from '..'

export type Data = {
  readonly aggregateId: string
  readonly aggregateVersion: bigint
  readonly createdAt: Date
  readonly published: boolean
}

export const create = (aggregate: AggregateData, createdAt: Date): Data => ({
  aggregateId: aggregate.id,
  aggregateVersion: aggregate.version,
  createdAt,
  published: false,
})

export type AnyEventPayload =
  | Pick<Post.Event, 'payload'>
  | Pick<User.Event, 'payload'>
  | Pick<FriendRequest.Event, 'payload'>
  | Pick<UserRelationship.Event, 'payload'>

export type AnyEvent = Post.Event | User.Event | FriendRequest.Event | UserRelationship.Event
