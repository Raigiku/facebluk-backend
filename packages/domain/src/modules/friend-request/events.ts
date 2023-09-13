import { Event } from '..'
import { TaggedType } from '../common'

export type Event = SentEvent | AcceptedEvent | CancelledEvent | RejectedEvent

export type RejectedEventPayload = TaggedType<'friend-request-rejected'>
export type RejectedEvent = {
  readonly data: Event.Data
  readonly payload: RejectedEventPayload
}

export type CancelledEventPayload = TaggedType<'friend-request-cancelled'>
export type CancelledEvent = {
  readonly data: Event.Data
  readonly payload: CancelledEventPayload
}

export type AcceptedEventPayload = TaggedType<'friend-request-accepted'>
export type AcceptedEvent = {
  readonly data: Event.Data
  readonly payload: AcceptedEventPayload
}

export type SentEventPayload = TaggedType<'friend-request-sent'> & {
  readonly fromUserId: string
  readonly toUserId: string
}
export type SentEvent = {
  readonly data: Event.Data
  readonly payload: SentEventPayload
}
