import { FastifyInstance, FastifyPluginCallback } from 'fastify'
import { friendRequestsRoutes } from '../friend-request'
import { postsRoutes } from '../post'
import { userRoutes } from '../user'

export const setupRoutes = async (server: FastifyInstance) => {
  await server.register(apiRoutes, { prefix: 'api' })
}

const apiRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(healthCheckRoute)
  await fastify.register(postsRoutes, { prefix: 'posts' })
  await fastify.register(friendRequestsRoutes, { prefix: 'friend-requests' })
  await fastify.register(userRoutes, { prefix: 'users' })
  done()
}

const healthCheckRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.get('/health-check', async (request, reply) => {
    await reply.status(200).send({ response: 'success' })
  })
  done()
}
