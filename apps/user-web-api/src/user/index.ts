import { FastifyPluginCallback } from "fastify"
import { registerUserRoute } from "./register-user-route"

export const userRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(registerUserRoute)
  done()
}