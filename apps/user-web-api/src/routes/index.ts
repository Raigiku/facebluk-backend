import { FastifyPluginCallback } from "fastify"
import { createPostRoute } from "./posts"

export const postsRoutes: FastifyPluginCallback = async (fastify, options, done) => {
  await fastify.register(createPostRoute)
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
