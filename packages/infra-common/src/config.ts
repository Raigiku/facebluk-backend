import { Logger } from '@facebluk/domain'

export type Config = {
  environment: EnvironmentVar
  logLevel: Logger.LogLevel
}

const create = (): Config => {
  const environment = process.env.ENVIRONMENT! as EnvironmentVar
  const logLevel = process.env.LOGLEVEL! as Logger.LogLevel
  return { environment, logLevel }
}

export const environmentVars = ['local', 'development', 'production'] as const
export type EnvironmentVar = (typeof environmentVars)[number]

export const Config = {
  create,
}
