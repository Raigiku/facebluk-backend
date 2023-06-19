import { ES, TaggedType } from '..'

export type Aggregate = {
  readonly aggregate: ES.Aggregate.Data
  readonly blockedStatus: BlockStatus
  readonly friendStatus: FriendStatus
}

export type BlockStatus = NotBlockedStatus | BlockedStatus | UnBlockedStatus
export type NotBlockedStatus = TaggedType<'not-blocked'>
export type BlockedStatus = TaggedType<'blocked'> & {
  readonly blockedAt: Date
  readonly fromUserId: string
  readonly toUserId: string
}
export type UnBlockedStatus = TaggedType<'unblocked'> & {
  readonly unblockedAt: Date
  readonly fromUserId: string
  readonly toUserId: string
}

export type FriendStatus = NotFriendedStatus | FriendedStatus | UnFriendedStatus
export type NotFriendedStatus = TaggedType<'not-friended'>
export type FriendedStatus = TaggedType<'friended'> & {
  readonly friendedAt: Date
  readonly fromUserId: string
  readonly toUserId: string
}
export type UnFriendedStatus = TaggedType<'unfriended'> & {
  readonly unfriendedAt: Date
  readonly fromUserId: string
  readonly toUserId: string
}

export const newFriend = (fromUserId: string, toUserId: string): [Aggregate, FriendedUserEvent] => {
  const aggregateData = ES.Aggregate.create()
  const friendedAt = new Date()
  return [
    {
      aggregate: aggregateData,
      blockedStatus: { tag: 'not-blocked' },
      friendStatus: { tag: 'friended', friendedAt, fromUserId, toUserId },
    },
    {
      data: ES.Event.create(aggregateData, friendedAt),
      payload: {
        tag: 'user-relationship-friended',
        fromUserId,
        toUserId,
      },
    },
  ]
}

export const friend = (
  userRelationship: Aggregate,
  fromUserId: string,
  toUserId: string
): [Aggregate, FriendedUserEvent] => {
  const aggregateData = ES.Aggregate.increaseVersion(userRelationship.aggregate)
  const friendedAt = new Date()
  return [
    {
      ...userRelationship,
      aggregate: aggregateData,
      friendStatus: { tag: 'friended', friendedAt, fromUserId, toUserId },
    },
    {
      data: ES.Event.create(aggregateData, friendedAt),
      payload: {
        tag: 'user-relationship-friended',
        fromUserId,
        toUserId,
      },
    },
  ]
}

export const unfriend = (
  userRelationship: Aggregate,
  fromUserId: string,
  toUserId: string
): [Aggregate, UnfriendedUserEvent] => {
  const aggregateData = ES.Aggregate.increaseVersion(userRelationship.aggregate)
  const unfriendedAt = new Date()
  return [
    {
      ...userRelationship,
      aggregate: aggregateData,
      friendStatus: { tag: 'unfriended', unfriendedAt, fromUserId, toUserId },
    },
    {
      data: ES.Event.create(aggregateData, unfriendedAt),
      payload: {
        tag: 'user-relationship-unfriended',
        fromUserId,
        toUserId,
      },
    },
  ]
}

export const newBlock = (fromUserId: string, toUserId: string): [Aggregate, BlockedUserEvent] => {
  const aggregateData = ES.Aggregate.create()
  const blockedAt = new Date()
  return [
    {
      aggregate: aggregateData,
      friendStatus: { tag: 'not-friended' },
      blockedStatus: { tag: 'blocked', blockedAt, fromUserId, toUserId },
    },
    {
      data: ES.Event.create(aggregateData, blockedAt),
      payload: {
        tag: 'user-relationship-blocked',
        fromUserId,
        toUserId,
      },
    },
  ]
}

export const block = (
  userRelationship: Aggregate,
  fromUserId: string,
  toUserId: string
): [Aggregate, BlockedUserEvent] => {
  const aggregateData = ES.Aggregate.increaseVersion(userRelationship.aggregate)
  const blockedAt = new Date()
  return [
    {
      ...userRelationship,
      aggregate: aggregateData,
      blockedStatus: { tag: 'blocked', blockedAt, fromUserId, toUserId },
    },
    {
      data: ES.Event.create(aggregateData, blockedAt),
      payload: {
        tag: 'user-relationship-blocked',
        fromUserId,
        toUserId,
      },
    },
  ]
}

export const unblock = (
  userRelationship: Aggregate,
  fromUserId: string,
  toUserId: string
): [Aggregate, UnblockedUserEvent] => {
  const aggregateData = ES.Aggregate.increaseVersion(userRelationship.aggregate)
  const unblockedAt = new Date()
  return [
    {
      ...userRelationship,
      aggregate: aggregateData,
      blockedStatus: { tag: 'unblocked', unblockedAt, fromUserId, toUserId },
    },
    {
      data: ES.Event.create(aggregateData, unblockedAt),
      payload: {
        tag: 'user-relationship-unblocked',
        fromUserId,
        toUserId,
      },
    },
  ]
}

// events
export type Event = FriendedUserEvent | UnfriendedUserEvent | BlockedUserEvent | UnblockedUserEvent

export type FriendedUserEventPayload = TaggedType<'user-relationship-friended'> & {
  readonly fromUserId: string
  readonly toUserId: string
}
export type FriendedUserEvent = {
  readonly data: ES.Event.Data
  readonly payload: FriendedUserEventPayload
}

export type UnfriendedUserEventPayload = TaggedType<'user-relationship-unfriended'> & {
  readonly fromUserId: string
  readonly toUserId: string
}
export type UnfriendedUserEvent = {
  readonly data: ES.Event.Data
  readonly payload: UnfriendedUserEventPayload
}

export type BlockedUserEventPayload = TaggedType<'user-relationship-blocked'> & {
  readonly fromUserId: string
  readonly toUserId: string
}
export type BlockedUserEvent = {
  readonly data: ES.Event.Data
  readonly payload: BlockedUserEventPayload
}

export type UnblockedUserEventPayload = TaggedType<'user-relationship-unblocked'> & {
  readonly fromUserId: string
  readonly toUserId: string
}
export type UnblockedUserEvent = {
  readonly data: ES.Event.Data
  readonly payload: UnblockedUserEventPayload
}

// accessors
export type FnFindOneBetweenUsers = (
  userAId: string,
  userBId: string
) => Promise<Aggregate | undefined>
export type FnFriend = (isNew: boolean, event: FriendedUserEvent) => Promise<void>
