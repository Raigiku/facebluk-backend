import { types } from 'pg'
import { pg } from './postgresql'

export type Data = {
  connectionString: string
} & pg.PoolConfig

export const create = (): Data => {
  types.setTypeParser(20, BigInt)
  return {
    connectionString: process.env.POSTGRESQL_DB_CONNECTION_STRING!,
  }
}
