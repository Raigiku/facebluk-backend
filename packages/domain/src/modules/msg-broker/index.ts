export type FnPublishMsg = (requestId: string, userId: string, exchange: string, msg: object) => Promise<void>
