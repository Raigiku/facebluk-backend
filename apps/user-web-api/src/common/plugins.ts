import { Common } from '@facebluk/infra-common'
import { PostgreSQL } from '@facebluk/infra-postgresql'
import { RabbitMQ } from '@facebluk/infra-rabbitmq'
import { Supabase } from '@facebluk/infra-supabase'
import { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    rabbitmqConn: RabbitMQ.amqp.Connection
    postgreSqlConn: PostgreSQL.pg.Pool
    supabaseConn: Supabase.SupabaseClient
    commonConfig: Common.Config.Data
  }

  interface FastifyRequest {
    rabbitmqChannel: RabbitMQ.amqp.Channel
  }
}

const rabbitMqConnPlugin: FastifyPluginCallback = async (fastify, options, done) => {
  const config = RabbitMQ.Config.create()
  let rabbitConn: RabbitMQ.amqp.Connection
  try {
    rabbitConn = await RabbitMQ.amqp.connect(config.connectionString)
  } catch (error) {
    throw new Error('RabbitMQ: could not connect', { cause: error })
  }

  fastify.addHook('onClose', async () => {
    try {
      await rabbitConn.close()
    } catch (error) {
      throw new Error('RabbitMQ: could not close', { cause: error })
    }
  })

  fastify.addHook('preHandler', async (request) => {
    try {
      request.rabbitmqChannel = await rabbitConn.createChannel()
    } catch (error) {
      throw new Error('RabbitMQ: could not create channel', { cause: error })
    }
  })

  fastify.addHook('onSend', async (request) => {
    if (request.rabbitmqChannel === undefined) {
      try {
        request.rabbitmqChannel = await rabbitConn.createChannel()
      } catch (error) {
        throw new Error('RabbitMQ: could not create channel', { cause: error })
      }
    }
    try {
      await request.rabbitmqChannel.close()
    } catch (error) {
      throw new Error('RabbitMQ: could not close', { cause: error })
    }
  })
  done()
}
export const fastifyRabbitMqConn = fp(rabbitMqConnPlugin, {
  name: 'fastify-rabbitmq-conn',
})

const postgreSqlConnPlugin: FastifyPluginCallback = async (fastify, options, done) => {
  if (!fastify.postgreSqlConn) {
    const config = PostgreSQL.Config.create()
    const pgPool = new PostgreSQL.pg.Pool({
      host: config.host,
      database: config.database,
      user: config.username,
      password: config.password,
      port: config.port,
    })

    try {
      await pgPool.connect()
    } catch (error) {
      throw new Error('PostgreSQL: could not connect', { cause: error })
    }

    fastify.decorate('postgreSqlConn', pgPool)

    fastify.addHook('onClose', async () => {
      try {
        await fastify.postgreSqlConn.end()
      } catch (error) {
        throw new Error('PostgreSQL: could not close', { cause: error })
      }
    })
  }
  done()
}
export const fastifyPostgreSqlConn = fp(postgreSqlConnPlugin, {
  name: 'fastify-postgresql-conn',
})

const supabaseConnPlugin: FastifyPluginCallback = (fastify, options, done) => {
  if (!fastify.supabaseConn) {
    const config = Supabase.Config.create()
    fastify.decorate('supabaseConn', Supabase.createSupabaseClient(config))
  }
  done()
}
export const fastifySupabaseConn = fp(supabaseConnPlugin, {
  name: 'fastify-supabase-conn',
})

const commonConfigPlugin: FastifyPluginCallback<Common.Config.Data> = (fastify, options, done) => {
  if (!fastify.commonConfig) {
    fastify.decorate('commonConfig', options)
  }
  done()
}
export const fastifyCommonConfig = fp(commonConfigPlugin, {
  name: 'fastify-common-config',
})
