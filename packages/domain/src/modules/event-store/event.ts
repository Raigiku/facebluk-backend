import { ES } from '..'

export type Data = {
  readonly aggregateId: string
  readonly aggregateVersion: bigint
  readonly createdAt: Date
  readonly published: boolean
}

export const create = (aggregate: ES.Aggregate.Data, createdAt: Date): Data => ({
  aggregateId: aggregate.id,
  aggregateVersion: aggregate.version,
  createdAt,
  published: false,
})

export type AnyEventPayload =
  | Pick<ES.Post.Event, 'payload'>
  | Pick<ES.FriendRequest.Event, 'payload'>
  | Pick<ES.UserRelationship.Event, 'payload'>
  | Pick<ES.User.Event, 'payload'>
export type AnyEvent =
  | ES.Post.Event
  | ES.FriendRequest.Event
  | ES.UserRelationship.Event
  | ES.User.Event
export type FnPersistEvent = (event: AnyEvent) => Promise<void>
export type FnPersistEvents = (events: AnyEvent[]) => Promise<void>
export type FnMarkEventAsSent = (event: AnyEvent) => Promise<void>
