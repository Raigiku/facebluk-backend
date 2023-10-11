export const logLevels = ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] as const
export type LogLevel = (typeof logLevels)[number]

export type FnLog = (level: LogLevel, requestId: string, message: string, userId?: string, error?: Error) => Promise<void>
