import { FastifyPluginCallback } from "fastify"
import { blockUserRoute } from "./block-user-route"
import { registerUserRoute } from "./register-user-route"
import { unblockUserRoute } from "./unblock-user-route"
import { unfriendUserRoute } from "./unfriend-user-route"

export const userRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(registerUserRoute)
  await fastify.register(blockUserRoute)
  await fastify.register(unblockUserRoute)
  await fastify.register(unfriendUserRoute)
  done()
}