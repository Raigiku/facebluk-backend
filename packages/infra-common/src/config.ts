import { Logger } from '@facebluk/domain'

export type Data = {
  environment: EnvironmentVar
  logLevel: Logger.LogLevel
}

export const create = (): Data => {
  const environment = process.env.ENVIRONMENT! as EnvironmentVar
  const logLevel = process.env.LOGLEVEL! as Logger.LogLevel
  return { environment, logLevel }
}

export const environmentVars = ['local', 'development', 'production'] as const
export type EnvironmentVar = (typeof environmentVars)[number]
