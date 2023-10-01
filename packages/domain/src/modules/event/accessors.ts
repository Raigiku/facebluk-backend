import { AnyEvent, AnyEventTag } from './models'

export namespace DbQueries {
  export type FindEvent = (eventId: string, eventTag: AnyEventTag) => Promise<AnyEvent | undefined>
}

export namespace Mutations {
  export type PublishEvent = (event: AnyEvent) => Promise<void>
}
