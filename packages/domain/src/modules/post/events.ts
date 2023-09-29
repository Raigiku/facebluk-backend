import { Event } from '..'
import { AggregateData, TaggedType } from '../common'

export type Event = CreatedEvent

export type CreatedEvent = {
  readonly data: Event.Data
  readonly payload: CreatedEvent.Payload
}

export namespace CreatedEvent {
  const tag = 'post-created'

  export type Payload = TaggedType<typeof tag> & {
    readonly userId: string
    readonly description: string
    readonly taggedUserIds: string[]
  }

  export const create = (
    requestId: string,
    id: string,
    description: string,
    userId: string,
    taggedUserIds: string[]
  ): CreatedEvent => {
    return {
      data: Event.create(requestId, AggregateData.createWithId(id)),
      payload: {
        tag: 'post-created',
        description,
        userId,
        taggedUserIds,
      },
    }
  }
}
