import { Event } from '..'
import { AggregateData, TaggedType } from '../common'
import { Aggregate, PendingStatus } from './models'

export type Event = SentEvent | AcceptedEvent | CancelledEvent | RejectedEvent

export type RejectedEvent = {
  readonly data: Event.Data
  readonly payload: RejectedEvent.Payload
}

export namespace RejectedEvent {
  const tag = 'friend-request-rejected'

  export type Payload = TaggedType<typeof tag>

  export const create = (
    requestId: string,
    friendRequest: Aggregate<PendingStatus>
  ): RejectedEvent => {
    return {
      data: Event.create(requestId, friendRequest.aggregate),
      payload: {
        tag: 'friend-request-rejected',
      },
    }
  }
}

export type CancelledEvent = {
  readonly data: Event.Data
  readonly payload: CancelledEvent.Payload
}

export namespace CancelledEvent {
  const tag = 'friend-request-cancelled'

  export type Payload = TaggedType<typeof tag>

  export const create = (
    requestId: string,
    friendRequest: Aggregate<PendingStatus>
  ): CancelledEvent => {
    return {
      data: Event.create(requestId, friendRequest.aggregate),
      payload: {
        tag: 'friend-request-cancelled',
      },
    }
  }
}

export type AcceptedEvent = {
  readonly data: Event.Data
  readonly payload: AcceptedEvent.Payload
}

export namespace AcceptedEvent {
  const tag = 'friend-request-accepted'

  export type Payload = TaggedType<typeof tag>

  export const create = (
    requestId: string,
    friendRequest: Aggregate<PendingStatus>
  ): AcceptedEvent => {
    return {
      data: Event.create(requestId, friendRequest.aggregate),
      payload: {
        tag: 'friend-request-accepted',
      },
    }
  }
}

export type SentEvent = {
  readonly data: Event.Data
  readonly payload: SentEvent.Payload
}

export namespace SentEvent {
  export const tag = 'friend-request-sent'

  export type Payload = TaggedType<typeof tag> & {
    readonly fromUserId: string
    readonly toUserId: string
  }

  export const create = (requestId: string, fromUserId: string, toUserId: string): SentEvent => {
    return {
      data: Event.create(requestId, AggregateData.create()),
      payload: {
        tag: 'friend-request-sent',
        fromUserId,
        toUserId,
      },
    }
  }
}
