import { BusinessRuleError, CMD, RequestImage, User } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { FastifyPluginCallback } from 'fastify'
import Joi from 'joi'
import { FormFile } from '../common'

export const registerUserRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post('/register/v1', async (request, reply) => {
    const rawFormData = request.body as RawFormData
    const formData = {
      name: rawFormData.name,
      alias: rawFormData.alias,
      profilePicture:
        rawFormData.profilePicture === undefined || rawFormData.profilePicture.length === 0
          ? undefined
          : RequestImage.create(
              rawFormData.profilePicture[0].data,
              rawFormData.profilePicture[0].mimetype
            ),
    }
    await syntaxValidator.validateAsync(formData)

    const aliasExists = await Infra.User.aliasExists(fastify.postgreSqlPool)(formData.alias!)
    if (aliasExists) throw new BusinessRuleError(request.id, 'alias already exists')

    await CMD.RegisterUser.handle(
      {
        requestId: request.id,
        userAuthMetadata: request.userAuthMetadata!,
        name: formData.name!,
        alias: formData.alias!,
        profilePicture: formData.profilePicture,
      },
      {
        findUserById: Infra.User.findOneById(fastify.postgreSqlPool),
        registerUser: Infra.User.register(request.postgreSqlPoolClient),
        findFileUrl: Infra.File.findFileUrl(fastify.supabaseClient),
        uploadFile: Infra.File.uploadFile(fastify.supabaseClient),
        markUserAsRegistered: Infra.User.markAsRegistered(
          fastify.supabaseClient,
          fastify.cLog,
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

const syntaxValidator = Joi.object({
  name: User.nameValidator.required(),
  alias: User.aliasValidator.required(),
  profilePicture: RequestImage.validator,
})

type RawFormData = {
  name?: string
  alias?: string
  profilePicture?: FormFile[]
}
