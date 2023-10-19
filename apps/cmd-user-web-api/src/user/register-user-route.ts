import { BusinessRuleError, CMD, RequestImage } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { FormFile, businessRuleErrorResponseSchema } from '../common'
import { Static, Type } from '@sinclair/typebox'

export const registerUserRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Reply: Static<typeof okResponseSchema> }>('/register-user/v1', routeOptions, async (request, reply) => {
    const formData = await buildFormData(request.body as RawFormData, request.id)

    const fileBucket = 'images'
    let fileRemotePath: string | null | undefined
    if (formData.profilePicture == null)
      fileRemotePath = formData.profilePicture
    else {
      const fileExt = `${RequestImage.fileExtension(formData.profilePicture.fileType)}`
      fileRemotePath = `users/${request.userAuthMetadata!.userId}/${formData.profilePicture.hash}.${fileExt}`
    }
    const profilePictureUrl =
      fileRemotePath == null ? fileRemotePath
        : Infra.File.generateFileUrl(fastify.supabaseClient)(fileBucket, fileRemotePath)

    await CMD.RegisterUser.validate(
      request.id,
      {
        alias: formData.alias,
        name: formData.name,
        profilePictureUrl,
      },
      {
        db_aliasExists: Infra.User.Queries.PostgreSQL.aliasExists(fastify.postgreSqlPool),
      }
    )

    if (fileRemotePath !== undefined && formData.profilePicture !== undefined)
      await Infra.File.uploadFile(fastify.supabaseClient)(
        fileBucket,
        fileRemotePath,
        formData.profilePicture.bytes,
        formData.profilePicture.fileType
      )

    await Infra.Event.sendBrokerMsg(request.rabbitMqChannel)(request.id, CMD.RegisterUser.id, {
      requestId: request.id,
      userAuthMetadata: request.userAuthMetadata!,
      name: formData.name,
      alias: formData.alias.toLowerCase(),
      profilePictureUrl,
    } as CMD.RegisterUser.Request)

    await reply.status(200).send({
      profilePictureUrl
    })
  })
  done()
}

const buildFormData = async (rawFormData: RawFormData, requestId: string) => {
  if (rawFormData.name === undefined) throw new BusinessRuleError(requestId, '"name" is required')
  if (rawFormData.alias === undefined) throw new BusinessRuleError(requestId, '"alias" is required')

  const parsedProfilePicture =
    rawFormData.profilePicture === undefined || rawFormData.profilePicture.length === 0 || rawFormData.profilePicture[0].data === undefined
      ? undefined
      : RequestImage.create(
        rawFormData.profilePicture[0].data,
        rawFormData.profilePicture[0].mimetype
      )
  await RequestImage.validator.validateAsync(parsedProfilePicture)

  return {
    name: rawFormData.name,
    alias: rawFormData.alias,
    profilePicture: parsedProfilePicture,
  }
}

type RawFormData = {
  name?: string
  alias?: string
  profilePicture?: FormFile[]
}
const okResponseSchema = Type.Object({
  profilePictureUrl: Type.Optional(Type.String())
})

const responseSchema = {
  200: okResponseSchema,
  ...businessRuleErrorResponseSchema,
}

const routeOptions: RouteShorthandOptions = {
  schema: {
    response: responseSchema,
  },
}
