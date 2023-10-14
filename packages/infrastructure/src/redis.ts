import redis, { RedisClientType } from 'redis'

export type Config = {
  connectionString: string
}

export const createConfig = (): Config => ({
  connectionString: process.env.REDIS_CONNECTION_STRING!,
})

export const createClient = (config: Config): RedisClientType => {
  return redis.createClient({
    url: config.connectionString
  })
}

export { RedisClientType }
