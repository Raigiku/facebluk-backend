import { Uuid } from '@facebluk/domain'
import * as dotenv from 'dotenv'
import Fastify from 'fastify'
import { setupErrorHandling, setupPlugins, setupRoutes } from './common'
import { Config } from './config'
import { Infra } from '@facebluk/infrastructure'

const runServer = async () => {
  const commonConfig = Infra.Common.createConfig()
  const server = Fastify({
    genReqId() {
      return Uuid.create()
    },
    logger: {
      level: commonConfig.logLevel,
      transport: { target: 'pino-pretty' },
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
