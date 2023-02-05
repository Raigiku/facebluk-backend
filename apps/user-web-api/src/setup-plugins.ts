import { Common } from '@facebluk/infra-common'
import fastifyCors from '@fastify/cors'
import fastifyResponseValidation from '@fastify/response-validation'
import { fastifySwagger } from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { FastifyInstance } from 'fastify'
import * as Config from './config'
import { fastifyCommonConfig, fastifyEventStoreConn, fastifyMsgBrokerConn, fastifyUserAuthConn } from './plugins'

const setupPlugins = async (server: FastifyInstance, webApiConfig: Config.Data, commonConfig: Common.Config.Data) => {
  // setup our plugins
  await server.register(fastifyCommonConfig, commonConfig)
  await server.register(fastifyUserAuthConn)
  await server.register(fastifyMsgBrokerConn)
  await server.register(fastifyEventStoreConn)
  // setup fastify plugins
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
}

export default setupPlugins
