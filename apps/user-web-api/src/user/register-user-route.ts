import { BusinessRuleError, CMD, RequestImage } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { FastifyPluginCallback } from 'fastify'
import { FormFile } from '../common'

export const registerUserRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post('/register-user/v1', async (request, reply) => {
    const rawFormData = request.body as RawFormData
    if (rawFormData.name === undefined)
      throw new BusinessRuleError(request.id, '"name" is required')
    if (rawFormData.alias === undefined)
      throw new BusinessRuleError(request.id, '"alias" is required')

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
    await CMD.RegisterUser.validate(request.id, formData, {
      aliasExists: Infra.User.aliasExists(fastify.postgreSqlPool),
    })

    await Infra.Event.sendBrokerMsg(request.rabbitMqChannel)(request.id, CMD.RegisterUser.id, {
      requestId: request.id,
      userAuthMetadata: request.userAuthMetadata!,
      name: formData.name,
      alias: formData.alias,
      profilePicture: formData.profilePicture,
    } as CMD.RegisterUser.Request)

    await reply.status(200).send()
  })
  done()
}

type RawFormData = {
  name?: string
  alias?: string
  profilePicture?: FormFile[]
}
