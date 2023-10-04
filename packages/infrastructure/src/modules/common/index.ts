import { EnvironmentVar, LogLevel } from '@facebluk/domain'

export * from './pg-transaction'
export * from './logger'

export type Config = {
  environment: EnvironmentVar
  logLevel: LogLevel
}

export const createConfig = (): Config => {
  const environment = process.env.ENVIRONMENT! as EnvironmentVar
  const logLevel = process.env.LOGLEVEL! as LogLevel
  return { environment, logLevel }
}
