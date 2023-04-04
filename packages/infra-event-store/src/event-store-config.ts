import { types } from 'pg'
import { pg } from './event-store'

export type Data = {
  connectionString: string
} & pg.PoolConfig

export const create = (): Data => {
  types.setTypeParser(20, BigInt)
  return {
    connectionString: process.env.EVENT_STORE_DB_CONNECTION_STRING!,
  }
}
