import { Client } from '@elastic/elasticsearch'

export type Config = {
  httpHost: string
  username: string
  password: string
}

export const createConfig = (): Config => ({
  httpHost: process.env.ELASTICSEARCH_HOST!,
  username: process.env.ELASTICSEARCH_USERNAME!,
  password: process.env.ELASTICSEARCH_PASSWORD!,
})

export const createClient = (config: Config) => {
  return new Client({
    node: config.httpHost,
    auth: {
      username: config.username,
      password: config.password,
    },
  })
}

export { Client }
