import { ES } from '@facebluk/domain'
import { PoolClient } from 'pg'

export const transaction =
  (pgClient: PoolClient): ES.FnTransaction =>
  async (fn: () => Promise<void>) => {
    try {
      await pgClient.query('BEGIN')
      await fn()
      await pgClient.query('COMMIT')
    } catch (error) {
      await pgClient.query('ROLLBACK')
      throw error
    }
  }
