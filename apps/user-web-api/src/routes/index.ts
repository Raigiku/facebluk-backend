import { FastifyPluginCallback } from 'fastify'
import { acceptFriendRequestRoute, sendFriendRequestRoute } from './friend-requests'
import { cancelFriendRequestRoute } from './friend-requests/cancel-friend-request'
import { rejectFriendRequestRoute } from './friend-requests/reject-friend-request'
import { createPostRoute } from './posts'

export const postsRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(createPostRoute)
  done()
}

export const friendRequestsRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(sendFriendRequestRoute)
  await fastify.register(acceptFriendRequestRoute)
  await fastify.register(rejectFriendRequestRoute)
  await fastify.register(cancelFriendRequestRoute)
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
