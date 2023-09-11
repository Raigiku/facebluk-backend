// mutations
export type FnUpload = (bucket: string, path: string, bytes: ArrayBuffer) => Promise<void>
// queries
export type FnFindFileUrl = (bucket: string, path: string) => string
