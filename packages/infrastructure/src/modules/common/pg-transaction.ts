import pg from 'pg'

export const pgTransaction = async <T>(pgClient: pg.PoolClient, innerFn: () => Promise<T>) => {
  try {
    await pgClient.query('BEGIN')
    const result = await innerFn()
    await pgClient.query('COMMIT')
    return result
  } catch (error) {
    await pgClient.query('ROLLBACK')
    throw error
  }
}
