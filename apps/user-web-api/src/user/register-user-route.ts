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

    await Infra.Event.sendBrokerMsg(request.rabbitMqChannel, request.id, CMD.RegisterUser.id, {
      requestId: request.id,
      userAuthMetadata: request.userAuthMetadata!,
      name: formData.name!,
      alias: formData.alias!,
      profilePicture: formData.profilePicture,
    } as CMD.RegisterUser.Request)

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
