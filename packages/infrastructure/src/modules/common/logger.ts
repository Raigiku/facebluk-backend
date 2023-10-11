import { BaseLogger } from 'pino'
import pinoPretty from 'pino-pretty'
import createPinoLogger from 'pino'
import { EnvironmentVar, FnLog, LogLevel } from '@facebluk/domain'
import { Point, WriteApi } from '@influxdata/influxdb-client'

export const logImpl =
  (pinoLogger: BaseLogger, influxDbWriteApi: WriteApi): FnLog =>
    async (level: LogLevel, requestId: string, message: string, userId?: string, error?: Error) => {
      const logMsg = buildLogMsg(requestId, message, userId, error)
      pinoLogger[level](logMsg)
      try {
        influxDbWriteApi.writePoint(new Point('logs')
          .tag('loglevel', level)
          .stringField('requestId', requestId)
          .stringField('userId', userId)
          .stringField('message', message)
          .stringField('errorMsg', error?.message)
          .stringField('errorObj', JSON.stringify(error))
        )
        await influxDbWriteApi.flush()
      } catch (error) {
        if (error instanceof Error)
          pinoLogger[level](buildLogMsg(requestId, 'could not log in influxdb', userId, error))
      }
    }

const buildLogMsg = (requestId: string, message: string, userId?: string, error?: Error) => {
  let logMsg = `requestId: ${requestId}`
  if (userId !== undefined) logMsg += ` | userId: ${userId}`
  if (error !== undefined)
    logMsg += ` | errorMsg: ${error.message} | errorObj: ${JSON.stringify(error)}`
  logMsg += ` | message: ${message}`
  return logMsg
}

export const createLogFn = (env: EnvironmentVar, influxDbWriteApi: WriteApi): FnLog => {
  const stream = env === 'local' ? pinoPretty() : undefined
  return logImpl(createPinoLogger(stream), influxDbWriteApi)
}
