import { Event } from '..'
import { TaggedType } from '../common'

export type Event = FriendedUserEvent | UnfriendedUserEvent | BlockedUserEvent | UnblockedUserEvent

export type FriendedUserEventPayload = TaggedType<'user-relationship-friended'> & {
  readonly fromUserId: string
  readonly toUserId: string
}
export type FriendedUserEvent = {
  readonly data: Event.Data
  readonly payload: FriendedUserEventPayload
}

export type UnfriendedUserEventPayload = TaggedType<'user-relationship-unfriended'> & {
  readonly fromUserId: string
  readonly toUserId: string
}
export type UnfriendedUserEvent = {
  readonly data: Event.Data
  readonly payload: UnfriendedUserEventPayload
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
