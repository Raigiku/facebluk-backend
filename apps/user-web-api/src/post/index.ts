import { FastifyPluginCallback } from "fastify"
import { createPostRoute } from "./create-post-route"

export const postsRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(createPostRoute)
  done()
}