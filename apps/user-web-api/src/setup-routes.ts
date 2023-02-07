import { FastifyInstance, FastifyPluginCallback } from 'fastify'
import { postsRoutes } from './routes'

const setupRoutes = async (server: FastifyInstance) => {
  await server.register(apiRoutes, { prefix: 'api' })
}

export const apiRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(postsRoutes, { prefix: 'posts' })
  done()
}

export default setupRoutes