export type FnPublishMsg = (requestId: string, exchange: string, msg: object) => Promise<void>
