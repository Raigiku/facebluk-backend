import { AnyEvent } from './models'

export namespace DbQueries {
  export type FindEvent = <T>(eventId: string) => Promise<T | undefined>
}

export namespace Mutations {
  export type PublishEvent = (event: AnyEvent) => Promise<void>
}
