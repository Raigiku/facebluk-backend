import { FastifyPluginCallback } from 'fastify'
import { sendFriendRequestRoute } from './friend-requests'
import { createPostRoute } from './posts'

export const postsRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(createPostRoute)
  done()
}

export const friendRequestsRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(sendFriendRequestRoute)
  done()
}

export const businessRuleErrorResponseSchema = {
  422: {
    description: 'Business rule validation',
    type: 'object',
    properties: {
      requestId: { type: 'string' },
      message: { type: 'string' },
    },
  },
}
