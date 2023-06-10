import { types } from 'pg'

export type Data = {
  host: string
  database: string
  username: string
  password: string
  port: number
}

export const create = (): Data => {
  types.setTypeParser(20, BigInt)
  return {
    host: process.env.POSTGRESQL_HOST!,
    database: process.env.POSTGRESQL_DB!,
    username: process.env.POSTGRESQL_USERNAME!,
    password: process.env.POSTGRESQL_PASSWORD!,
    port: parseInt(process.env.POSTGRESQL_PORT!),
  }
}
