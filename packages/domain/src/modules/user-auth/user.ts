export type Aggregate = {
  id: string
}

// accessors
export type FnGetById = (id: string) => Promise<Aggregate | undefined>
