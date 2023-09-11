import { CreatedEvent } from './events'

// mutations
export type FnCreate = (event: CreatedEvent) => Promise<void>
