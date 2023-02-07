import { Uuid } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import * as dotenv from 'dotenv'
import Fastify from 'fastify'
import * as Config from './config'
import setupErrorHandling from './setup-error-handling'
import setupPlugins from './setup-plugins'
import setupRoutes from './setup-routes'

const runServer = async () => {
  const commonConfig = Common.Config.newA()
  const server = Fastify({
    genReqId() {
      return Uuid.newA()
    },
    logger: {
      level: commonConfig.logLevel,
      transport: commonConfig.environment === 'production' ? undefined : { target: 'pino-pretty' },
    },
  })
  const webApiConfig = Config.newA()
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
