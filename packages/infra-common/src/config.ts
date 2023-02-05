export type Data = {
  environment: EnvironmentVar
  logLevel: LogLevel
}

export const newA = (): Data => {
  const environment = process.env.ENVIRONMENT! as EnvironmentVar
  const logLevel = process.env.LOGLEVEL! as LogLevel
  return { environment, logLevel }
}

export const environmentVars = ['local', 'development', 'production'] as const
export type EnvironmentVar = (typeof environmentVars)[number]

export const logLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const
export type LogLevel = (typeof logLevels)[number]
