import { CMD, RequestImage } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { FastifyPluginCallback, RouteShorthandOptions } from 'fastify'
import { FormFile, businessRuleErrorResponseSchema } from '../common'
import { Static, Type } from '@sinclair/typebox'

export const updateUserInfoRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post<{ Reply: Static<typeof okResponseSchema> }>('/update-user-info/v1', routeOptions, async (request, reply) => {
    const formData = buildFormData(request.body as RawFormData)

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

    const valRes = await CMD.UpdateUserInfo.validate(
      request.id,
      {
        name: formData.name,
        profilePictureUrl: profilePictureUrl,
        userId: request.userAuthMetadata!.userId,
      },
      { findUserById: Infra.User.Queries.PostgreSQL.findById(fastify.postgreSqlPool) }
    )

    if (formData.profilePicture != null && fileRemotePath != null)
      await Infra.File.uploadFile(fastify.supabaseClient)(
        fileBucket,
        fileRemotePath,
        formData.profilePicture.bytes,
        formData.profilePicture.fileType
      )

    await Infra.Event.sendBrokerMsg(request.rabbitMqChannel)(request.id, CMD.UpdateUserInfo.id, {
      requestId: request.id,
      name: formData.name,
      profilePictureUrl: profilePictureUrl,
      user: valRes.user,
    } as CMD.UpdateUserInfo.Request)

    await reply.status(200).send({
      profilePictureUrl: profilePictureUrl == null ? undefined : profilePictureUrl
    })
  })
  done()
}

const buildFormData = (rawFormData: RawFormData) => {
  return {
    name: rawFormData.name,
    profilePicture:
      rawFormData.profilePicture === null
        ? null
        : rawFormData.profilePicture === undefined || rawFormData.profilePicture.length === 0 || rawFormData.profilePicture[0].data === undefined
          ? undefined
          : RequestImage.create(
            rawFormData.profilePicture[0].data,
            rawFormData.profilePicture[0].mimetype
          ),
  }
}

type RawFormData = {
  name?: string
  profilePicture?: FormFile[] | null
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
