import { RedisClientType, createClient as redisCreateClient } from 'redis'

export type Config = {
  connectionString: string
}

export const createConfig = (): Config => ({
  connectionString: process.env.REDIS_CONNECTION_STRING!,
})

export const createClient = (config: Config): RedisClientType => {
  return redisCreateClient({
    url: config.connectionString
  })
}

export { RedisClientType }
