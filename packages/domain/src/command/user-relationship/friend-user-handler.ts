import Joi from 'joi'
import { Event, UserRelationship, Uuid } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  const userRelationship = await deps.findUserRelationshipBetween(req.fromUserId, req.toUserId)
  const isNewFriendRelationship = userRelationship === undefined

  const friendedRelationshipEvent = isNewFriendRelationship
    ? UserRelationship.newFriend(req.fromUserId, req.toUserId)
    : UserRelationship.friend(userRelationship, req.fromUserId, req.toUserId)

  await deps.friendUser(isNewFriendRelationship, friendedRelationshipEvent)
  await deps.publishEvent(req.requestId, friendedRelationshipEvent)
}

export type Dependencies = {
  findUserRelationshipBetween: UserRelationship.FnFindOneBetweenUsers
  friendUser: UserRelationship.FnFriend
  publishEvent: Event.FnPublishEvent
}

export type Request = {
  readonly requestId: string
  readonly fromUserId: string
  readonly toUserId: string
}

export const id = 'friend-user'

export const validate = async (payload: ValidatePayload) => {
  await syntaxValidator.validateAsync(payload)
}

type ValidatePayload = {
  readonly fromUserId: string
  readonly toUserId: string
}

const syntaxValidator = Joi.object({
  fromUserId: Uuid.validator.required(),
  toUserId: Uuid.validator.required(),
})
