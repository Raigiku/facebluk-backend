import { FnLog, User, Uuid } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { FastifyPluginCallback } from 'fastify'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    postgreSqlPool: Infra.PostgreSQL.Pool
    rabbitMqConnection: Infra.RabbitMQ.Connection
    supabaseClient: Infra.Supabase.SupabaseClient
    commonConfig: Infra.Common.Config
    cLog: FnLog
  }

  interface FastifyRequest {
    rabbitMqChannel: Infra.RabbitMQ.Channel
    postgreSqlPoolClient: Infra.PostgreSQL.PoolClient
    userAuthMetadata?: User.AuthMetadata
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
const rabbitMqPlugin: FastifyPluginCallback<Infra.RabbitMQ.Config> = async (
  fastify,
  options,
  done
) => {
  if (fastify.rabbitMqConnection != null) {
    done()
    return
  }

  try {
    const rabbitConn = await Infra.RabbitMQ.connect(options)
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
            fastify.rabbitMqConnection = await Infra.RabbitMQ.connect(options)
            request.rabbitMqChannel = await fastify.rabbitMqConnection.createChannel()
            return
          } catch (error) { }
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

const postgreSqlPlugin: FastifyPluginCallback<Infra.PostgreSQL.Config> = (
  fastify,
  options,
  done
) => {
  if (fastify.postgreSqlPool != null) {
    done()
    return
  }

  const pgPool = new Infra.PostgreSQL.Pool({
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

const supabasePlugin: FastifyPluginCallback<Infra.Supabase.Config> = (fastify, options, done) => {
  if (fastify.supabaseClient != null) {
    done()
    return
  }

  fastify.decorate('supabaseClient', Infra.Supabase.createClient(options))
  done()
}
export const fastifySupabase = fp(supabasePlugin, {
  name: 'fastify-supabase-plugin',
})

const commonPlugin: FastifyPluginCallback<Infra.Common.Config> = (fastify, options, done) => {
  if (fastify.commonConfig != null) {
    done()
    return
  }
  fastify.decorate('commonConfig', options)

  if (fastify.cLog != null) {
    done()
    return
  }
  fastify.decorate('cLog', Infra.Common.log(fastify.log))

  done()
}
export const fastifyCommonPlugin = fp(commonPlugin, {
  name: 'fastify-common-plugin',
})

const userAuthPlugin: FastifyPluginCallback<Infra.Common.Config> = (fastify, options, done) => {
  fastify.addHook('onRequest', async (request) => {
    const authHeader = request.headers.authorization
    if (authHeader === undefined) throw new Error('auth header undefined')

    if (!authHeader.toLowerCase().startsWith('bearer '))
      throw new Error('auth header is not bearer token')

    let userId
    if (options.environment !== 'production') {
      try {
        userId = authHeader.split(' ')[1]
        await Uuid.validator.validateAsync(userId)
      } catch (error) {
        throw new Error('auth header is not an uuid')
      }
    } else {
      const jwt: Infra.User.Supabase.JwtModel = await request.jwtVerify()
      userId = jwt.sub
    }

    const userAuthMetadata = await Infra.User.Queries.Supabase.findAuthMetadata(
      fastify.supabaseClient,
      fastify.cLog,
      request.id
    )(userId)
    if (userAuthMetadata === undefined) throw new Error('authenticated user does not exist')
    request.userAuthMetadata = userAuthMetadata
  })

  done()
}
export const fastifyUserAuth = fp(userAuthPlugin, {
  name: 'fastify-user-auth-plugin',
})
