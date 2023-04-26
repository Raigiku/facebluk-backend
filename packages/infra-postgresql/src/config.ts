import { types } from 'pg'

export type Data = {
  connectionString: string
}

export const create = (): Data => {
  types.setTypeParser(20, BigInt)
  return {
    connectionString: process.env.POSTGRESQL_DB_CONNECTION_STRING!,
  }
}
