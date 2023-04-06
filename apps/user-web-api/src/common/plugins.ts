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

const rabbitmqConnPlugin: FastifyPluginCallback = async (fastify, options, done) => {
  const config = RabbitMQ.Config.create()
  const connection = await RabbitMQ.amqp.connect(config.connectionString)

  fastify.addHook('onClose', async () => {
    await connection.close()
  })

  fastify.addHook('preHandler', async (request) => {
    request.rabbitmqChannel = await connection.createChannel()
  })

  fastify.addHook('onSend', async (request) => {
    if (request.rabbitmqChannel === undefined) {
      request.rabbitmqChannel = await connection.createChannel()
    }
    await request.rabbitmqChannel.close()
  })
  done()
}
export const fastifyrabbitmqConn = fp(rabbitmqConnPlugin, {
  name: 'fastify-rabbitmq-conn',
})

const postgreSqlConnPlugin: FastifyPluginCallback = (fastify, options, done) => {
  if (!fastify.postgreSqlConn) {
    const config = PostgreSQL.Config.create()

    fastify.decorate('postgreSqlConn', new PostgreSQL.pg.Pool(config))

    fastify.addHook('onClose', async () => {
      await fastify.postgreSqlConn.end()
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
