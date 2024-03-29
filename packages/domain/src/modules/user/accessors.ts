import { InfoUpdatedEvent, RegisteredEvent } from './events'
import { Aggregate, AuthMetadata } from './models'

export namespace DbQueries {
  export type AliasExists = (alias: string) => Promise<boolean>
  export type FindById = (userId: string) => Promise<Aggregate | undefined>
}

export namespace AuthQueries {
  export type FindAuthMetadata = (id: string) => Promise<AuthMetadata | undefined>
}

export namespace Mutations {
  export type Register = (
    event: RegisteredEvent,
    persistEvent: boolean,
    markAsRegistered: boolean
  ) => Promise<void>

  export type UpdateInfo = (event: InfoUpdatedEvent, persistEvent: boolean) => Promise<void>
}
