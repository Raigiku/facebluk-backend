export const environmentVars = ['local', 'development', 'production'] as const
export type EnvironmentVar = (typeof environmentVars)[number]
