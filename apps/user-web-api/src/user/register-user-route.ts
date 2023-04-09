import { BusinessRuleError, CMD, INT, RequestImage } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import { PostgreSQL } from '@facebluk/infra-postgresql'
import { RabbitMQ } from '@facebluk/infra-rabbitmq'
import { Supabase } from '@facebluk/infra-supabase'
import { FastifyPluginCallback } from 'fastify'
import { FormFile } from '../common'

export const registerUserRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post('/register', async (request, reply) => {
    const jwt: Supabase.UserAuth.User.JwtModel = await request.jwtVerify()

    const formData = request.body as FormData

    if (formData.name === undefined)
      throw new BusinessRuleError(request.id, 'name is a required string field')

      if (formData.alias === undefined)
      throw new BusinessRuleError(request.id, 'alias is a required string field')

    if (formData.profilePicture !== undefined) {
      if (formData.profilePicture.length === 0)
        throw new BusinessRuleError(request.id, 'profile picture must have at least 1 image')
      if (formData.profilePicture[0].type === 'file')
        throw new BusinessRuleError(request.id, 'profile picture is a required file')
    }

    await CMD.RegisterUser.handle(
      {
        id: request.id,
        userId: jwt.sub,
        name: formData.name,
        alias: formData.alias,
        profilePicture:
          formData.profilePicture === undefined
            ? undefined
            : RequestImage.create(
                formData.profilePicture[0].data.buffer,
                formData.profilePicture[0].mimetype
              ),
      },
      {
        getUserById: Supabase.UserAuth.User.getById(
          fastify.supabaseConn,
          Common.Logger.log(fastify.log),
          request.id
        ),
        getUserProfilePictureUrl: Supabase.FileStorage.User.getProfilePictureUrl(
          fastify.supabaseConn
        ),
        uploadProfilePicture: Supabase.FileStorage.User.uploadProfilePicture(fastify.supabaseConn),
        markUserAsRegistered: Supabase.UserAuth.User.markAsRegistered(
          fastify.supabaseConn,
          Common.Logger.log(fastify.log),
          request.id
        ),
        getRegisteredUserEvent: PostgreSQL.User.getRegisteredUserEvent(
          fastify.postgreSqlConn
        ),
        processEvent: INT.Event.processEvent(
          PostgreSQL.Common.persistEvent(fastify.postgreSqlConn),
          RabbitMQ.publishEvent(request.rabbitmqChannel),
          PostgreSQL.Common.markEventAsSent(fastify.postgreSqlConn)
        ),
      }
    )

    await reply.status(200).send()
  })
  done()
}

type FormData = {
  readonly name?: string
  readonly alias?:string
  readonly profilePicture?: FormFile[]
}
