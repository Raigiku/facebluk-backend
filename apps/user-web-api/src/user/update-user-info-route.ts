import { BusinessRuleError, CMD, RequestImage, User } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { FastifyPluginCallback } from 'fastify'
import { FormFile } from '../common'
import Joi from 'joi'

export const updateUserInfoRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post('/update-info/v1', async (request, reply) => {
    const rawFormData = request.body as RawFormData
    const formData = {
      name: rawFormData.name,
      profilePicture:
        rawFormData.profilePicture === undefined || rawFormData.profilePicture.length === 0
          ? undefined
          : RequestImage.create(
            rawFormData.profilePicture[0].data,
            rawFormData.profilePicture[0].mimetype
          ),
    }
    await syntaxValidator.validateAsync(formData)

    if (formData.name === undefined && formData.profilePicture === undefined)
      throw new BusinessRuleError(request.id, '"name" and "profilePicture" are both undefined')

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

const syntaxValidator = Joi.object({
  name: User.nameValidator,
  profilePicture: RequestImage.validator,
})

type RawFormData = {
  name?: string
  profilePicture?: FormFile[]
}
