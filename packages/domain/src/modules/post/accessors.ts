import { CreatedEvent } from './events'

export namespace Mutations {
  export type Create = (event: CreatedEvent, persistEvent: boolean) => Promise<void>

  export type ApplyCreatedEvent = (event: CreatedEvent) => Promise<void>
}
