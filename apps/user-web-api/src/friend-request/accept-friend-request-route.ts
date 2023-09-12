import { CMD } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { Static, Type } from '@sinclair/typebox'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { businessRuleErrorResponseSchema } from '../common'

export const acceptFriendRequestRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Body: Static<typeof bodySchema> }>(
    '/accept/v1',
    routeOptions,
    async (request, reply) => {
      const jwt: Infra.User.JwtModel = await request.jwtVerify()
      await CMD.AcceptFriendRequest.handle(
        {
          id: request.id,
          userId: jwt.sub,
          friendRequestId: request.body.friendRequestId,
        },
        {
          findFriendRequest: Infra.FriendRequest.findOneById(fastify.postgreSqlPool),
          acceptFriendRequest: Infra.FriendRequest.accept(request.postgreSqlPoolClient),
          findUserRelationshipBetween: Infra.UserRelationship.findOneBetweenUsers(
            fastify.postgreSqlPool
          ),
          publishEvents: Infra.Event.publishEvents(
            request.rabbitMqChannel,
            request.postgreSqlPoolClient,
            fastify.cLog
          ),
          friendUser: Infra.UserRelationship.friend(request.postgreSqlPoolClient),
        }
      )
      await reply.status(200).send()
    }
  )
  done()
}

const bodySchema = Type.Object({
  friendRequestId: Type.String({ minLength: 1, format: 'uuid' }),
})

const responseSchema = {
  200: {
    type: 'object',
  },
  ...businessRuleErrorResponseSchema,
}

const routeOptions: RouteShorthandOptions = {
  schema: {
    body: bodySchema,
    response: responseSchema,
  },
}
