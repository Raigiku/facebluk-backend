import { Common } from '@facebluk/infra-common'
import { PostgreSQL } from '@facebluk/infra-postgresql'
import { RabbitMQ } from '@facebluk/infra-rabbitmq'
import { Supabase } from '@facebluk/infra-supabase'
import { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    postgreSqlPool: PostgreSQL.pg.Pool
    rabbitMqConnection: RabbitMQ.amqp.Connection
    supabaseClient: Supabase.SupabaseClient
    commonConfig: Common.Config.Data
  }

  interface FastifyRequest {
    rabbitMqChannel: RabbitMQ.amqp.Channel
    postgreSqlPoolClient: PostgreSQL.pg.PoolClient
  }
}

const rabbitMqConnectionErrorCodes = [
  '320',
  '402',
  '501',
  '502',
  '503',
  '504',
  '505',
  '506',
  '530',
  '540',
  '541',
]
const rabbitMqPlugin: FastifyPluginCallback<RabbitMQ.Config.Data> = async (
  fastify,
  options,
  done
) => {
  if (fastify.rabbitMqConnection != null) {
    done()
    return
  }

  try {
    const rabbitConn = await RabbitMQ.amqp.connect(options.connectionString)
    fastify.decorate('rabbitMqConnection', rabbitConn)
  } catch (error) {
    throw new Error('RabbitMQ: could not connect', { cause: error })
  }

  fastify.addHook('onClose', async () => {
    try {
      await fastify.rabbitMqConnection.close()
    } catch (error) {
      throw new Error('RabbitMQ: could not close connection', { cause: error })
    }
  })

  fastify.addHook('onRequest', async (request) => {
    try {
      request.rabbitMqChannel = await fastify.rabbitMqConnection.createChannel()
      return
    } catch (error) {
      if (error instanceof Error) {
        const errorMsg = error.message
        const isConnectionError = rabbitMqConnectionErrorCodes.some((code) =>
          errorMsg.includes(code)
        )
        if (isConnectionError) {
          try {
            fastify.rabbitMqConnection = await RabbitMQ.amqp.connect(options.connectionString)
            request.rabbitMqChannel = await fastify.rabbitMqConnection.createChannel()
            return
          } catch (error) {}
        }
      }
      throw new Error('RabbitMQ: could not create channel', { cause: error })
    }
  })

  fastify.addHook('onResponse', async (request) => {
    if (request.rabbitMqChannel == null) return
    try {
      await request.rabbitMqChannel.close()
    } catch (error) {
      throw new Error('RabbitMQ: could not close channel', { cause: error })
    }
  })
  done()
}
export const fastifyRabbitMq = fp(rabbitMqPlugin, {
  name: 'fastify-rabbitmq-plugin',
})

const postgreSqlPlugin: FastifyPluginCallback<PostgreSQL.Config.Data> = (
  fastify,
  options,
  done
) => {
  if (fastify.postgreSqlPool != null) {
    done()
    return
  }

  const pgPool = new PostgreSQL.pg.Pool({
    host: options.host,
    database: options.database,
    user: options.username,
    password: options.password,
    port: options.port,
  })
  fastify.decorate('postgreSqlPool', pgPool)

  fastify.addHook('onClose', async () => {
    try {
      await fastify.postgreSqlPool.end()
    } catch (error) {
      throw new Error('PostgreSQL: could not close', { cause: error })
    }
  })

  fastify.addHook('onRequest', async (request) => {
    try {
      request.postgreSqlPoolClient = await fastify.postgreSqlPool.connect()
    } catch (error) {
      throw new Error('PostgreSQL: could not connect', { cause: error })
    }
  })

  fastify.addHook('onResponse', (request) => {
    if (request.postgreSqlPoolClient == null) return
    try {
      request.postgreSqlPoolClient.release()
    } catch (error) {
      throw new Error('PostgreSQL: could not close', { cause: error })
    }
  })
  done()
}
export const fastifyPostgreSql = fp(postgreSqlPlugin, {
  name: 'fastify-postgresql-plugin',
})

const supabasePlugin: FastifyPluginCallback<Supabase.Config.Data> = (fastify, options, done) => {
  if (fastify.supabaseClient != null) {
    done()
    return
  }

  fastify.decorate('supabaseClient', Supabase.createSupabaseClient(options))
  done()
}
export const fastifySupabase = fp(supabasePlugin, {
  name: 'fastify-supabase-plugin',
})

const commonPlugin: FastifyPluginCallback<Common.Config.Data> = (fastify, options, done) => {
  if (fastify.commonConfig != null) {
    done()
    return
  }

  fastify.decorate('commonConfig', options)
  done()
}
export const fastifyCommonPlugin = fp(commonPlugin, {
  name: 'fastify-common-plugin',
})
