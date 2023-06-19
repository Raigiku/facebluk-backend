export type FnTransaction = (fn: () => Promise<void>) => Promise<void>
