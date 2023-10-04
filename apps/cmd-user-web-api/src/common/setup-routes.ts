import { FastifyInstance, FastifyPluginCallback } from 'fastify'
import { fastifyUserAuth } from './plugins'
import {
  acceptFriendRequestRoute,
  cancelFriendRequestRoute,
  rejectFriendRequestRoute,
  sendFriendRequestRoute,
} from '../friend-request'
import { createPostRoute } from '../post'
import { registerUserRoute, unfriendUserRoute, updateUserInfoRoute } from '../user'

export const setupRoutes = async (server: FastifyInstance) => {
  await server.register(apiRoutes, { prefix: 'api' })
}

const apiRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(testRoute)
  await fastify.register(healthCheckRoute)
  await fastify.register(authenticatedRoutes)
  done()
}

const testRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post('/test', async (request, reply) => {
    await reply.status(200).send({ response: 'success' })
  })
  done()
}

const healthCheckRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.get('/health-check', async (request, reply) => {
    await reply.status(200).send({ response: 'success' })
  })
  done()
}

const authenticatedRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(fastifyUserAuth, fastify.commonConfig)
  // friend requests
  await fastify.register(sendFriendRequestRoute)
  await fastify.register(acceptFriendRequestRoute)
  await fastify.register(rejectFriendRequestRoute)
  await fastify.register(cancelFriendRequestRoute)
  // posts
  await fastify.register(createPostRoute)
  // users
  await fastify.register(registerUserRoute)
  await fastify.register(updateUserInfoRoute)
  await fastify.register(unfriendUserRoute)
  // await fastify.register(blockUserRoute)
  // await fastify.register(unblockUserRoute)

  done()
}
