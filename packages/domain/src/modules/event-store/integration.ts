import { ES } from '..'

export type FnAcceptFriendship = (
  acceptedFriendRequestEvent: ES.FriendRequest.AcceptedEvent,
  friendedRelationshipEvent: ES.UserRelationship.FriendedUserEvent
) => Promise<void>
