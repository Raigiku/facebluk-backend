import { Aggregate } from '.'
import { Event } from '..'
import { AggregateData, TaggedType } from '../common'

export type Event = RegisteredEvent | InfoUpdatedEvent

export type RegisteredEvent = {
  readonly data: Event.Data
  readonly payload: RegisteredEvent.Payload
}

export namespace RegisteredEvent {
  export const tag = 'user-registered'

  export type Payload = TaggedType<typeof tag> & {
    readonly name: string
    readonly profilePictureUrl?: string
    readonly alias: string
  }

  export const create = (
    requestId: string,
    userId: string,
    name: string,
    alias: string,
    profilePictureUrl?: string
  ): RegisteredEvent => {
    alias = alias.toLowerCase()
    return {
      data: Event.create(requestId, AggregateData.createWithId(userId)),
      payload: {
        tag: 'user-registered',
        name,
        profilePictureUrl,
        alias,
      },
    }
  }
}

export type InfoUpdatedEvent = {
  readonly data: Event.Data
  readonly payload: InfoUpdatedEvent.Payload
}

export namespace InfoUpdatedEvent {
  const tag = 'user-info-updated'

  export type Payload = TaggedType<typeof tag> & {
    readonly name?: string
    readonly profilePictureUrl?: string | null
  }

  export const create = (
    requestId: string,
    user: Aggregate,
    name?: string,
    profilePictureUrl?: string | null
  ): InfoUpdatedEvent => {
    return {
      data: Event.create(requestId, user.aggregate),
      payload: {
        tag: 'user-info-updated',
        name,
        profilePictureUrl,
      },
    }
  }
}
