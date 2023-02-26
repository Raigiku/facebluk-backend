import { FastifyInstance, FastifyPluginCallback } from 'fastify'
import { friendRequestsRoutes, postsRoutes, userRelationshipsRoutes } from './routes'

const setupRoutes = async (server: FastifyInstance) => {
  await server.register(apiRoutes, { prefix: 'api' })
}

export const apiRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(postsRoutes, { prefix: 'posts' })
  await fastify.register(friendRequestsRoutes, { prefix: 'friend-requests' })
  await fastify.register(userRelationshipsRoutes, { prefix: 'user-relationships' })
  done()
}

export default setupRoutes
