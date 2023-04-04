import { BusinessRuleError, CMD, INT, RequestImage } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import { EventStore } from '@facebluk/infra-event-store'
import { FileStorage } from '@facebluk/infra-file-storage'
import { MessageBroker } from '@facebluk/infra-message-broker'
import { UserAuth } from '@facebluk/infra-user-auth'
import { FastifyPluginCallback } from 'fastify'
import { FormFile } from '../common'

export const registerUserRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.post('/register', async (request, reply) => {
    const jwt: UserAuth.AuthJwt = await request.jwtVerify()

    const formData = request.body as FormData

    if (formData.name === undefined)
      throw new BusinessRuleError(request.id, 'name is a required string field')

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
        profilePicture:
          formData.profilePicture === undefined
            ? undefined
            : RequestImage.create(
                formData.profilePicture[0].data,
                formData.profilePicture[0].mimetype
              ),
      },
      {
        getUserById: UserAuth.Accessor.getUserById(
          fastify.userAuthFileStorageConn,
          Common.Logger.log(fastify.log),
          request.id
        ),
        getUserProfilePictureUrl: FileStorage.Accessor.User.getProfilePictureUrl(
          fastify.userAuthFileStorageConn
        ),
        uploadProfilePicture: FileStorage.Accessor.User.uploadProfilePicture(
          fastify.userAuthFileStorageConn
        ),
        markUserAsRegistered: UserAuth.Accessor.markUserAsRegistered(
          fastify.userAuthFileStorageConn,
          Common.Logger.log(fastify.log),
          request.id
        ),
        getRegisteredUserEvent: EventStore.Accessor.User.getRegisteredUserEvent(
          fastify.eventStoreConn
        ),
        processEvent: INT.Event.processEvent(
          EventStore.Accessor.Event.persistEvent(fastify.eventStoreConn),
          MessageBroker.publishEvent(request.msgBrokerChannel),
          EventStore.Accessor.Event.markEventAsSent(fastify.eventStoreConn)
        ),
      }
    )

    await reply.status(200).send()
  })
  done()
}

type FormData = {
  readonly name?: string
  readonly profilePicture?: FormFile[]
}
