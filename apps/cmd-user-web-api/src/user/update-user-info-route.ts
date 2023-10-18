import { CMD, RequestImage } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { FastifyPluginCallback } from 'fastify'
import { FormFile } from '../common'

export const updateUserInfoRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post('/update-user-info/v1', async (request, reply) => {
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

    await reply.status(200).send()
  })
  done()
}

const buildFormData = (rawFormData: RawFormData) => {
  return {
    name: rawFormData.name,
    profilePicture:
      rawFormData.profilePicture === null
        ? null
        : rawFormData.profilePicture === undefined || rawFormData.profilePicture.length === 0
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
