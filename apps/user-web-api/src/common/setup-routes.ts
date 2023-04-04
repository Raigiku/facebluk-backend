import { FastifyInstance, FastifyPluginCallback } from 'fastify'
import { friendRequestsRoutes } from '../friend-request'
import { postsRoutes } from '../post'
import { userRoutes } from '../user'
import { userRelationshipsRoutes } from '../user-relationship'

export const setupRoutes = async (server: FastifyInstance) => {
  await server.register(apiRoutes, { prefix: 'api' })
}

const apiRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(postsRoutes, { prefix: 'posts' })
  await fastify.register(friendRequestsRoutes, { prefix: 'friend-requests' })
  await fastify.register(userRelationshipsRoutes, { prefix: 'user-relationships' })
  await fastify.register(userRoutes, { prefix: 'users' })
  done()
}
