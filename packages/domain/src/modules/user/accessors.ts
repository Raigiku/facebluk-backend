import { InfoUpdatedEvent, RegisteredEvent } from './events'
import { Aggregate, AuthMetadata } from './models'

// mutations
export type FnRegister = (event: RegisteredEvent) => Promise<void>
export type FnUpdateInfo = (event: InfoUpdatedEvent) => Promise<void>
export type FnMarkAsRegistered = (id: string, registeredAt: Date) => Promise<void>
// queries
export type FnAliasExists = (alias: string) => Promise<boolean>
export type FnFindOneById = (id: string) => Promise<Aggregate | undefined>
export type FnFindRegisteredEvent = (userId: string) => Promise<RegisteredEvent | undefined>
export type FnFindAuthMetadata = (id: string) => Promise<AuthMetadata | undefined>
export type FnAreFriends = (userAId: string, userBId: string) => Promise<boolean>
