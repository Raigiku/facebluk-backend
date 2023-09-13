import { Common } from '@facebluk/infra-common'
import { Infra } from '@facebluk/infrastructure'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastifyResponseValidation from '@fastify/response-validation'
import { fastifySwagger } from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { FastifyInstance } from 'fastify'
import { fastifyCommonPlugin, fastifyPostgreSql, fastifyRabbitMq, fastifySupabase } from '.'
import * as Config from '../config'

export const setupPlugins = async (
  server: FastifyInstance,
  webApiConfig: Config.Config,
  commonConfig: Common.Config
) => {
  // init env configs
  const userAuthConfig = Infra.Supabase.createConfig()
  const postgreSqlConfig = Infra.PostgreSQL.createConfig()
  const rabbitMqConfig = Infra.RabbitMQ.createConfig()
  // setup fastify plugins
  await server.register(fastifyMultipart, {
    addToBody: true,
  })
  await server.register(fastifyJwt, {
    secret: userAuthConfig.supabaseJwtSecret,
  })
  await server.register(fastifyCors, {
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
    credentials: true,
  })
  await server.register(fastifyResponseValidation)
  await server.register(fastifySwagger, {
    mode: 'static',
    specification: {
      baseDir: './apps/user-web-api/documentation',
      path: './apps/user-web-api/documentation/openapi-docs.yaml',
    },
  })
  if (commonConfig.environment !== 'production')
    await server.register(fastifySwaggerUi, {
      routePrefix: '/swagger',
    })
  // setup our plugins
  await server.register(fastifyCommonPlugin, commonConfig)
  await server.register(fastifySupabase, userAuthConfig)
  await server.register(fastifyRabbitMq, rabbitMqConfig)
  await server.register(fastifyPostgreSql, postgreSqlConfig)
}
