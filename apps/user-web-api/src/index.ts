import { Uuid } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import * as dotenv from 'dotenv'
import Fastify from 'fastify'
import { setupErrorHandling, setupPlugins, setupRoutes } from './common'
import * as Config from './config'

const runServer = async () => {
  const commonConfig = Common.Config.create()
  const server = Fastify({
    genReqId() {
      return Uuid.create()
    },
    logger: {
      level: commonConfig.logLevel,
      transport: commonConfig.environment === 'production' ? undefined : { target: 'pino-pretty' },
    },
  })
  const webApiConfig = Config.create()
  await setupPlugins(server, webApiConfig, commonConfig)
  setupErrorHandling(server)
  await setupRoutes(server)
  await server.listen({ port: webApiConfig.port })
}

const main = async () => {
  dotenv.config()
  await runServer()
}

main()
  .then()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
