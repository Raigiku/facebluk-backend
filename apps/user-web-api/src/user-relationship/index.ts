import { FastifyPluginCallback } from "fastify"
import { blockUserRoute } from "./block-user-route"
import { unblockUserRoute } from "./unblock-user-route"
import { unfriendUserRoute } from "./unfriend-user-route"

export const userRelationshipsRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(blockUserRoute)
  await fastify.register(unblockUserRoute)
  await fastify.register(unfriendUserRoute)
  done()
}
