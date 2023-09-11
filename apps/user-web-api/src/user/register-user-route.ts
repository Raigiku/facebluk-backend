import { BusinessRuleError, CMD, RequestImage } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import { Infra } from '@facebluk/infrastructure'
import { FastifyPluginCallback } from 'fastify'
import { FormFile } from '../common'

export const registerUserRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post('/register/v1', async (request, reply) => {
    const jwt: Infra.User.JwtModel = await request.jwtVerify()

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
                formData.profilePicture[0].data,
                formData.profilePicture[0].mimetype
              ),
      },
      {
        aliasExists: Infra.User.aliasExists(fastify.postgreSqlPool),
        findUserById: Infra.User.findOneById(fastify.postgreSqlPool),
        registerUser: Infra.User.register(request.postgreSqlPoolClient),
        findUserAuthMetadata: Infra.User.findAuthMetadata(
          fastify.supabaseClient,
          Common.Logger.log(fastify.log),
          request.id
        ),
        findFileUrl: Infra.File.findFileUrl(fastify.supabaseClient),
        uploadFile: Infra.File.uploadFile(fastify.supabaseClient),
        markUserAsRegistered: Infra.User.markAsRegistered(
          fastify.supabaseClient,
          Common.Logger.log(fastify.log),
          request.id
        ),
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
  alias?: string
  profilePicture?: FormFile[]
}
