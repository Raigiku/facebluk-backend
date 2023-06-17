export type Aggregate = {
  readonly id: string
  readonly registeredAt?: Date
}

export const isRegistered = (user: Aggregate): boolean => user.registeredAt !== undefined

// accessors
export type FnFindOneById = (id: string) => Promise<Aggregate | undefined>
export type FnMarkUserAsRegistered = (id: string, registeredAt: Date) => Promise<void>
