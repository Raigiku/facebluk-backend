import { UserRelationship } from '..'
import { AcceptedEvent, CancelledEvent, RejectedEvent, SentEvent } from './events'
import { Aggregate, AggregateStatus } from './models'

export namespace DbQueries {
  export type FindById = (id: string) => Promise<Aggregate<AggregateStatus> | undefined>
  export type FindLastBetweenUsers = (
    userAId: string,
    userBId: string
  ) => Promise<Aggregate<AggregateStatus> | undefined>
}

export namespace Mutations {
  export type Send = (event: SentEvent, persistEvent: boolean) => Promise<void>

  export type Cancel = (event: CancelledEvent, persistEvent: boolean) => Promise<void>

  export type Reject = (event: RejectedEvent, persistEvent: boolean) => Promise<void>

  export type Accept = (
    friendRequestEvent: AcceptedEvent,
    persistEvents: boolean,
    userRelationshipEvent: UserRelationship.FriendedUserEvent,
    didCreateNewUserRelationship: boolean
  ) => Promise<void>
}
