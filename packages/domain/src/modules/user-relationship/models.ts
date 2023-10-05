import { AggregateData, TaggedType } from '../common'

export type Aggregate<T1 extends BlockStatus, T2 extends FriendStatus> = {
  readonly aggregate: AggregateData
  readonly blockedStatus: T1
  readonly friendStatus: T2
}

export type BlockStatus = NotBlockedStatus | BlockedStatus | UnBlockedStatus

export type NotBlockedStatus = TaggedType<'not-blocked'>
export const isNotBlocked = (
  aggregate: Aggregate<BlockStatus, FriendStatus>
): aggregate is Aggregate<NotBlockedStatus, FriendStatus> =>
  aggregate.blockedStatus.tag === 'not-blocked'

export const blockedTag = 'blocked'
export type BlockedStatus = TaggedType<typeof blockedTag> & {
  readonly blockedAt: Date
  readonly fromUserId: string
  readonly toUserId: string
}
export const isBlocked = (
  aggregate: Aggregate<BlockStatus, FriendStatus>
): aggregate is Aggregate<BlockedStatus, FriendStatus> => aggregate.blockedStatus.tag === 'blocked'

export type UnBlockedStatus = TaggedType<'unblocked'> & {
  readonly unblockedAt: Date
  readonly fromUserId: string
  readonly toUserId: string
}
export const isUnBlocked = (
  aggregate: Aggregate<BlockStatus, FriendStatus>
): aggregate is Aggregate<UnBlockedStatus, FriendStatus> =>
  aggregate.blockedStatus.tag === 'unblocked'

export type FriendStatus = NotFriendedStatus | FriendedStatus | UnFriendedStatus

export type NotFriendedStatus = TaggedType<'not-friended'>
export const isNotFriend = (
  aggregate: Aggregate<BlockStatus, FriendStatus>
): aggregate is Aggregate<BlockStatus, NotFriendedStatus> =>
  aggregate.friendStatus.tag === 'not-friended'

export const friendedStatusTag = 'friended'
export type FriendedStatus = TaggedType<typeof friendedStatusTag> & {
  readonly friendedAt: Date
  readonly fromUserId: string
  readonly toUserId: string
}
export const isFriend = (
  aggregate: Aggregate<BlockStatus, FriendStatus>
): aggregate is Aggregate<BlockStatus, FriendedStatus> => aggregate.friendStatus.tag === 'friended'

export type UnFriendedStatus = TaggedType<'unfriended'> & {
  readonly unfriendedAt: Date
  readonly fromUserId: string
  readonly toUserId: string
}
export const isUnFriended = (
  aggregate: Aggregate<BlockStatus, FriendStatus>
): aggregate is Aggregate<BlockStatus, UnFriendedStatus> =>
  aggregate.friendStatus.tag === 'unfriended'

// export const newBlock = (
//   fromUserId: string,
//   toUserId: string
// ): [Aggregate<BlockedStatus, NotFriendedStatus>, BlockedUserEvent] => {
//   const aggregateData = AggregateData.create()
//   const blockedAt = new Date()
//   return [
//     {
//       aggregate: aggregateData,
//       friendStatus: { tag: 'not-friended' },
//       blockedStatus: { tag: 'blocked', blockedAt, fromUserId, toUserId },
//     },
//     {
//       data: Event.create(aggregateData, blockedAt),
//       payload: {
//         tag: 'user-relationship-blocked',
//         fromUserId,
//         toUserId,
//       },
//     },
//   ]
// }

// export const block = (
//   userRelationship: Aggregate<BlockStatus, FriendStatus>,
//   fromUserId: string,
//   toUserId: string
// ): [Aggregate<BlockedStatus, FriendStatus>, BlockedUserEvent] => {
//   const aggregateData = AggregateData.increaseVersion(userRelationship.aggregate)
//   const blockedAt = new Date()
//   return [
//     {
//       ...userRelationship,
//       aggregate: aggregateData,
//       blockedStatus: { tag: 'blocked', blockedAt, fromUserId, toUserId },
//     },
//     {
//       data: Event.create(aggregateData, blockedAt),
//       payload: {
//         tag: 'user-relationship-blocked',
//         fromUserId,
//         toUserId,
//       },
//     },
//   ]
// }

// export const unblock = (
//   userRelationship: Aggregate<BlockStatus, FriendStatus>,
//   fromUserId: string,
//   toUserId: string
// ): [Aggregate<UnBlockedStatus, FriendStatus>, UnblockedUserEvent] => {
//   const aggregateData = AggregateData.increaseVersion(userRelationship.aggregate)
//   const unblockedAt = new Date()
//   return [
//     {
//       ...userRelationship,
//       aggregate: aggregateData,
//       blockedStatus: { tag: 'unblocked', unblockedAt, fromUserId, toUserId },
//     },
//     {
//       data: Event.create(aggregateData, unblockedAt),
//       payload: {
//         tag: 'user-relationship-unblocked',
//         fromUserId,
//         toUserId,
//       },
//     },
//   ]
// }
