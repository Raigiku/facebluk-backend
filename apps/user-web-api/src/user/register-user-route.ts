import { BusinessRuleError, CMD, RequestImage } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { FastifyPluginCallback } from 'fastify'
import { FormFile } from '../common'

export const registerUserRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post('/register-user/v1', async (request, reply) => {
    const formData = buildFormData(request.body as RawFormData, request.id)

    const fileBucket = 'images'
    const fileRemotePath = `users/${request.userAuthMetadata!.userId}/${
      formData.profilePicture?.id
    }`
    const profilePictureUrl =
      formData.profilePicture !== undefined
        ? Infra.File.generateFileUrl(fastify.supabaseClient)(fileBucket, fileRemotePath)
        : undefined

    await CMD.RegisterUser.validate(
      request.id,
      {
        alias: formData.alias,
        name: formData.name,
        profilePictureUrl,
      },
      {
        db_aliasExists: Infra.User.aliasExists(fastify.postgreSqlPool),
      }
    )

    if (formData.profilePicture !== undefined)
      await Infra.File.uploadFile(fastify.supabaseClient)(
        fileBucket,
        fileRemotePath,
        formData.profilePicture.bytes
      )

    await Infra.Event.sendBrokerMsg(request.rabbitMqChannel)(request.id, CMD.RegisterUser.id, {
      requestId: request.id,
      userAuthMetadata: request.userAuthMetadata!,
      name: formData.name,
      alias: formData.alias,
      profilePictureUrl,
    } as CMD.RegisterUser.Request)

    await reply.status(200).send()
  })
  done()
}

const buildFormData = (rawFormData: RawFormData, requestId: string) => {
  if (rawFormData.name === undefined) throw new BusinessRuleError(requestId, '"name" is required')
  if (rawFormData.alias === undefined) throw new BusinessRuleError(requestId, '"alias" is required')

  return {
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
}

type RawFormData = {
  name?: string
  alias?: string
  profilePicture?: FormFile[]
}
