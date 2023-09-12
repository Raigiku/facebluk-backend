import { Logger } from '@facebluk/domain'
import { FastifyBaseLogger } from 'fastify'

export const log =
  (logger: FastifyBaseLogger): Logger.FnLog =>
  (level: Logger.LogLevel, requestId: string, message: string, userId?: string, error?: Error) => {
    let logMsg = `requestId: ${requestId}`
    if (userId !== undefined) logMsg += ` | userId: ${userId}`
    if (error !== undefined)
      logMsg += ` | errorMsg: ${error.message} | errorObj: ${JSON.stringify(error)}`
    logMsg += ` | message: ${message}`
    logger[level](logMsg)
  }
