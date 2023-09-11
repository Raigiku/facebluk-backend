import { BusinessRuleError, CMD, RequestImage } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { FastifyPluginCallback } from 'fastify'
import { FormFile } from '../common'

export const updateUserInfoRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post('/update-info/v1', async (request, reply) => {
    const jwt: Infra.User.JwtModel = await request.jwtVerify()

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
                formData.profilePicture[0].data,
                formData.profilePicture[0].mimetype
              ),
      },
      {
        updateUserInfo: Infra.User.updateInfo(request.postgreSqlPoolClient),
        findUserById: Infra.User.findOneById(fastify.postgreSqlPool),
        findFileUrl: Infra.File.findFileUrl(fastify.supabaseClient),
        uploadFile: Infra.File.uploadFile(fastify.supabaseClient),
        publishEvent: Infra.Event.publishEvent(
          request.rabbitMqChannel,
          request.postgreSqlPoolClient
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
