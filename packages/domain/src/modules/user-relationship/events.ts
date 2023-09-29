import { Aggregate, BlockStatus, FriendStatus } from '.'
import { Event } from '..'
import { AggregateData, TaggedType } from '../common'

export type Event = FriendedUserEvent | UnfriendedUserEvent | BlockedUserEvent | UnblockedUserEvent

export type FriendedUserEvent = {
  readonly data: Event.Data
  readonly payload: FriendedUserEvent.Payload
}

export namespace FriendedUserEvent {
  const tag = 'user-relationship-friended'

  export type Payload = TaggedType<typeof tag> & {
    readonly fromUserId: string
    readonly toUserId: string
  }

  export const createNewRelationship = (
    requestId: string,
    fromUserId: string,
    toUserId: string
  ): FriendedUserEvent => {
    return {
      data: Event.create(requestId, AggregateData.create()),
      payload: {
        tag: 'user-relationship-friended',
        fromUserId,
        toUserId,
      },
    }
  }

  export const createForExistingRelationship = (
    requestId: string,
    userRelationship: Aggregate<BlockStatus, FriendStatus>,
    fromUserId: string,
    toUserId: string
  ): FriendedUserEvent => {
    return {
      data: Event.create(requestId, userRelationship.aggregate),
      payload: {
        tag: 'user-relationship-friended',
        fromUserId,
        toUserId,
      },
    }
  }
}

export type UnfriendedUserEvent = {
  readonly data: Event.Data
  readonly payload: UnfriendedUserEvent.Payload
}

export namespace UnfriendedUserEvent {
  const tag = 'user-relationship-unfriended'

  export type Payload = TaggedType<typeof tag> & {
    readonly fromUserId: string
    readonly toUserId: string
  }

  export const create = (
    requestId: string,
    userRelationship: Aggregate<BlockStatus, FriendStatus>,
    fromUserId: string,
    toUserId: string
  ): UnfriendedUserEvent => {
    return {
      data: Event.create(requestId, userRelationship.aggregate),
      payload: {
        tag: 'user-relationship-unfriended',
        fromUserId,
        toUserId,
      },
    }
  }
}

export type BlockedUserEventPayload = TaggedType<'user-relationship-blocked'> & {
  readonly fromUserId: string
  readonly toUserId: string
}
export type BlockedUserEvent = {
  readonly data: Event.Data
  readonly payload: BlockedUserEventPayload
}

export type UnblockedUserEventPayload = TaggedType<'user-relationship-unblocked'> & {
  readonly fromUserId: string
  readonly toUserId: string
}
export type UnblockedUserEvent = {
  readonly data: Event.Data
  readonly payload: UnblockedUserEventPayload
}
