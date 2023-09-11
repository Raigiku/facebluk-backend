import { EventData } from '..'
import { TaggedType } from '../common'

export type Event = CreatedEvent

export type CreatedEventPayload = TaggedType<'post-created'> & {
  readonly userId: string
  readonly description: string
  readonly taggedUserIds: string[]
}
export type CreatedEvent = {
  readonly data: EventData.Data
  readonly payload: CreatedEventPayload
}
