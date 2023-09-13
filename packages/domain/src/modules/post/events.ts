import { Event } from '..'
import { TaggedType } from '../common'

export type Event = CreatedEvent

export type CreatedEventPayload = TaggedType<'post-created'> & {
  readonly userId: string
  readonly description: string
  readonly taggedUserIds: string[]
}
export type CreatedEvent = {
  readonly data: Event.Data
  readonly payload: CreatedEventPayload
}
