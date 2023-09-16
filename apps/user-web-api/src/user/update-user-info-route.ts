import { CMD, RequestImage, User } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'
import { FastifyPluginCallback } from 'fastify'
import { FormFile } from '../common'
import Joi from 'joi'

export const updateUserInfoRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post('/update-user-info/v1', async (request, reply) => {
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

    const valRes = await CMD.UpdateUserInfo.validate(
      request.id,
      { ...formData, userId: request.userAuthMetadata!.id },
      { findUserById: Infra.User.findOneById(fastify.postgreSqlPool) }
    )

    await Infra.Event.sendBrokerMsg<CMD.UpdateUserInfo.Request>(
      request.rabbitMqChannel,
      request.id,
      CMD.UpdateUserInfo.id,
      {
        requestId: request.id,
        name: formData.name,
        profilePicture: formData.profilePicture,
        user: valRes.user,
      }
    )

    await reply.status(200).send()
  })
  done()
}

type RawFormData = {
  name?: string
  profilePicture?: FormFile[]
}
