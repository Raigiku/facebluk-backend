import { FastifyPluginCallback } from 'fastify'
import {
  acceptFriendRequestRoute,
  cancelFriendRequestRoute,
  rejectFriendRequestRoute,
  sendFriendRequestRoute
} from './friend-requests'
import { createPostRoute } from './posts'
import { blockUserRoute, unblockUserRoute, unfriendUserRoute } from './user-relationship'

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

export const userRelationshipsRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(blockUserRoute)
  await fastify.register(unblockUserRoute)
  await fastify.register(unfriendUserRoute)
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
