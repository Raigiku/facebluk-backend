import { FastifyPluginCallback } from 'fastify'
import { acceptFriendRequestRoute } from './accept-friend-request-route'
import { cancelFriendRequestRoute } from './cancel-friend-request-route'
import { rejectFriendRequestRoute } from './reject-friend-request-route'
import { sendFriendRequestRoute } from './send-friend-request-route'

export const friendRequestsRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(sendFriendRequestRoute)
  await fastify.register(acceptFriendRequestRoute)
  await fastify.register(rejectFriendRequestRoute)
  await fastify.register(cancelFriendRequestRoute)
  done()
}
