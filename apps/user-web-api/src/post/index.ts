import { FastifyPluginCallback } from 'fastify'
import { fastifyUserAuth } from '../common'
import { createPostRoute } from './create-post-route'

export const postsRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(fastifyUserAuth, fastify.commonConfig)
  await fastify.register(createPostRoute)
  done()
}
