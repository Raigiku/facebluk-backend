import { ES, TaggedType } from '..'

export type Aggregate = UnfriendAggregate | BlockAggregate

export type AggregateData = {
  readonly data: ES.Aggregate.Data
  readonly fromUserId: string
  readonly toUserId: string
}

export type UnfriendAggregate = AggregateData & {
  readonly unfriendedAt: Date
} & TaggedType<'unfriend-aggregate'>

export type BlockAggregate = AggregateData & {
  readonly blockedAt: Date
} & TaggedType<'block-aggregate'>

export type UnblockAggregate = AggregateData & {
  readonly unblockedAt: Date
} & TaggedType<'unblock-aggregate'>

export const unfriend = (fromUserId: string, toUserId: string): [UnfriendAggregate, UnfriendedUserEvent] => {
  const aggregateData = ES.Aggregate.newA()
  const unfriendedAt = new Date()
  return [
    {
      data: aggregateData,
      tag: 'unfriend-aggregate',
      fromUserId,
      toUserId,
      unfriendedAt,
    },
    {
      data: ES.Event.newA(aggregateData, unfriendedAt),
      payload: {
        tag: 'user-relationship-unfriended',
        fromUserId,
        toUserId,
      },
    },
  ]
}

export const block = (fromUserId: string, toUserId: string): [BlockAggregate, BlockedUserEvent] => {
  const aggregateData = ES.Aggregate.newA()
  const blockedAt = new Date()
  return [
    {
      data: aggregateData,
      tag: 'block-aggregate',
      fromUserId,
      toUserId,
      blockedAt,
    },
    {
      data: ES.Event.newA(aggregateData, blockedAt),
      payload: {
        tag: 'user-relationship-blocked',
        fromUserId,
        toUserId,
      },
    },
  ]
}

export const unblock = (fromUserId: string, toUserId: string): [UnblockAggregate, UnblockedUserEvent] => {
  const aggregateData = ES.Aggregate.newA()
  const unblockedAt = new Date()
  return [
    {
      data: aggregateData,
      tag: 'unblock-aggregate',
      fromUserId,
      toUserId,
      unblockedAt,
    },
    {
      data: ES.Event.newA(aggregateData, unblockedAt),
      payload: {
        tag: 'user-relationship-unblocked',
        fromUserId,
        toUserId,
      },
    },
  ]
}

// events
export type Event = UnfriendedUserEvent | BlockedUserEvent | UnblockedUserEvent

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
export type FnGetBetweenUsers = (userAId: string, userBId: string) => Promise<Aggregate | undefined>
