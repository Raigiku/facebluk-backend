import { Common } from '@facebluk/infra-common'
import { UserAuth } from '@facebluk/infra-user-auth'
import fastifyCors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import fastifyMultipart from '@fastify/multipart'
import fastifyResponseValidation from '@fastify/response-validation'
import { fastifySwagger } from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { FastifyInstance } from 'fastify'
import {
  fastifyCommonConfig,
  fastifyEventStoreConn,
  fastifyMsgBrokerConn,
  fastifyUserAuthFileStorageConn,
} from '.'
import * as Config from '../config'

export const setupPlugins = async (
  server: FastifyInstance,
  webApiConfig: Config.Data,
  commonConfig: Common.Config.Data
) => {
  // init env configs
  const userAuthConfig = UserAuth.Config.create()
  // setup fastify plugins
  await server.register(fastifyMultipart, {
    addToBody: true,
  })
  await server.register(fastifyJwt, {
    secret: userAuthConfig.supabaseJwtSecret,
  })
  await server.register(fastifyCors, {
    origin: webApiConfig.consumerUrl,
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
  await server.register(fastifySwaggerUi, {
    routePrefix: '/swagger',
  })
  // setup our plugins
  await server.register(fastifyCommonConfig, commonConfig)
  await server.register(fastifyUserAuthFileStorageConn)
  await server.register(fastifyMsgBrokerConn)
  await server.register(fastifyEventStoreConn)
}