import { FastifyPluginCallback } from 'fastify'
import { fastifyUserAuth } from '../common'
import { registerUserRoute } from './register-user-route'
import { unfriendUserRoute } from './unfriend-user-route'
import { updateUserInfoRoute } from './update-user-info-route'

export const userRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(fastifyUserAuth, fastify.commonConfig)
  await fastify.register(registerUserRoute)
  // await fastify.register(blockUserRoute)
  // await fastify.register(unblockUserRoute)
  await fastify.register(unfriendUserRoute)
  await fastify.register(updateUserInfoRoute)
  done()
}
