import { EventData } from '..'
import { TaggedType } from '../common'

export type Event = RegisteredEvent | InfoUpdatedEvent

export const registeredEventTag = 'user-registered'
export type RegisteredEventPayload = TaggedType<typeof registeredEventTag> & {
  readonly name: string
  readonly profilePictureUrl?: string
  readonly alias: string
}
export type RegisteredEvent = {
  readonly data: EventData.Data
  readonly payload: RegisteredEventPayload
}

export const updatedInfoEventTag = 'user-info-updated'
export type InfoUpdatedEventPayload = TaggedType<typeof updatedInfoEventTag> & {
  readonly name?: string
  readonly profilePictureUrl?: string
}
export type InfoUpdatedEvent = {
  readonly data: EventData.Data
  readonly payload: InfoUpdatedEventPayload
}
