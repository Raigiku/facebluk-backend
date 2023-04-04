import { BusinessRuleError } from '@facebluk/domain'
import { FastifyInstance } from 'fastify'

export const setupErrorHandling = (server: FastifyInstance) => {
  server.setErrorHandler(async (error, request, reply) => {
    if (error.statusCode !== undefined) {
      await reply.status(error.statusCode).send({ message: error.message })
      return
    }

    if (error instanceof BusinessRuleError) {
      await reply.status(422).send({ requestId: error.requestId, message: error.message })
      return
    }

    if (server.commonConfig.environment == 'production') {
      await reply.status(500).send({ message: 'unexpected error' })
      return
    }

    await reply.status(500).send({ message: error.message, details: error })
  })
}
