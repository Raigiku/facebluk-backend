import { BusinessRuleError, CMD, INT, RequestImage } from '@facebluk/domain'
import { PostgreSQL } from '@facebluk/infra-postgresql'
import { RabbitMQ } from '@facebluk/infra-rabbitmq'
import { Supabase } from '@facebluk/infra-supabase'
import { FastifyPluginCallback } from 'fastify'
import { FormFile } from '../common'

export const updateUserInfoRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post('/update-info', async (request, reply) => {
    const jwt: Supabase.UserAuth.JwtModel = await request.jwtVerify()

    const formData = request.body as FormData

    if (formData.profilePicture !== undefined) {
      if (formData.profilePicture.length === 0)
        throw new BusinessRuleError(request.id, 'profile picture must have at least 1 image')
      if (formData.profilePicture[0].type === 'file')
        throw new BusinessRuleError(request.id, 'profile picture is a required file')
    }

    await CMD.UpdateUserInfo.handle(
      {
        id: request.id,
        userId: jwt.sub,
        name: formData.name,
        profilePicture:
          formData.profilePicture === undefined
            ? undefined
            : RequestImage.create(
                formData.profilePicture[0].data.buffer,
                formData.profilePicture[0].mimetype
              ),
      },
      {
        es_updateInfo: PostgreSQL.User.updateInfo(request.postgreSqlPoolClient),
        es_findUserById: PostgreSQL.User.findOneById(fastify.postgreSqlPool),
        fs_findUserProfilePictureUrl: Supabase.FileStorage.User.findProfilePictureUrl(
          fastify.supabaseClient
        ),
        fs_uploadProfilePicture: Supabase.FileStorage.User.uploadProfilePicture(
          fastify.supabaseClient
        ),
        int_processEvent: INT.Event.processEvent(
          RabbitMQ.publishEvent(request.rabbitMqChannel),
          PostgreSQL.Common.markEventAsSent(request.postgreSqlPoolClient)
        ),
      }
    )

    await reply.status(200).send()
  })
  done()
}

type FormData = {
  name?: string
  profilePicture?: FormFile[]
}
