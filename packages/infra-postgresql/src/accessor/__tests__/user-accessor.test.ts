import { Uuid } from '@facebluk/domain'
import { Pool } from 'pg'
import { persistEvent } from '../../common'
import { truncateTables } from '../../helpers'
import { Config, User } from '../../postgresql'

describe('user-accessor', () => {
  let pgPool: Pool

  beforeAll(() => {
    Config.create()
    pgPool = new Pool({ connectionString: (global as any).POSTGRESQL_TEST_DB_CONNECTION_STRING })
  })

  afterAll(async () => {
    await pgPool.end()
  })

  beforeEach(async () => {
    await truncateTables(pgPool)
  })

  describe(User.aliasExists.name, () => {
    test('when the alias exists then return false', async () => {
      const alias = 'alias1'
      await persistEvent(pgPool)({
        data: {
          aggregateId: Uuid.create(),
          aggregateVersion: 1n,
          createdAt: new Date(),
          published: false,
        },
        payload: { tag: 'user-registered', name: '', alias },
      })
      const isAliasAvailable = await User.aliasExists(pgPool)(alias)
      expect(isAliasAvailable).toBeFalsy()
    })

    test('when the alias doesnt exists then return true', async () => {
      await persistEvent(pgPool)({
        data: {
          aggregateId: Uuid.create(),
          aggregateVersion: 1n,
          createdAt: new Date(),
          published: false,
        },
        payload: { tag: 'user-registered', name: '', alias: 'camero' },
      })
      const isAliasAvailable = await User.aliasExists(pgPool)('alias1')
      expect(isAliasAvailable).toBeTruthy()
    })
  })
})
