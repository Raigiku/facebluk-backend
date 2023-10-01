import { Logger } from '@facebluk/domain'
import { BaseLogger } from 'pino'
import { EnvironmentVar } from './config'
import pinoPretty from 'pino-pretty'
import createPinoLogger from 'pino'

export const log =
  (logger: BaseLogger): Logger.FnLog =>
  (level: Logger.LogLevel, requestId: string, message: string, userId?: string, error?: Error) => {
    let logMsg = `requestId: ${requestId}`
    if (userId !== undefined) logMsg += ` | userId: ${userId}`
    if (error !== undefined)
      logMsg += ` | errorMsg: ${error.message} | errorObj: ${JSON.stringify(error)}`
    logMsg += ` | message: ${message}`
    logger[level](logMsg)
  }

export const createLogFn = (env: EnvironmentVar): Logger.FnLog => {
  const stream = env === 'local' ? pinoPretty() : undefined
  return log(createPinoLogger(stream))
}
