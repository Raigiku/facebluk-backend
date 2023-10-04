import { BaseLogger } from 'pino'
import pinoPretty from 'pino-pretty'
import createPinoLogger from 'pino'
import { EnvironmentVar, FnLog, LogLevel } from '@facebluk/domain'

export const log =
  (logger: BaseLogger): FnLog =>
  (level: LogLevel, requestId: string, message: string, userId?: string, error?: Error) => {
    let logMsg = `requestId: ${requestId}`
    if (userId !== undefined) logMsg += ` | userId: ${userId}`
    if (error !== undefined)
      logMsg += ` | errorMsg: ${error.message} | errorObj: ${JSON.stringify(error)}`
    logMsg += ` | message: ${message}`
    logger[level](logMsg)
  }

export const createLogFn = (env: EnvironmentVar): FnLog => {
  const stream = env === 'local' ? pinoPretty() : undefined
  return log(createPinoLogger(stream))
}
