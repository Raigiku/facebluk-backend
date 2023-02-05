import { Pool } from 'pg'
import { Accessor } from './event-store'

export const truncateTables = async (pool: Pool) => {
  await pool.query(`
    TRUNCATE ${Accessor.Category.TABLE_NAME}
  `)
}
