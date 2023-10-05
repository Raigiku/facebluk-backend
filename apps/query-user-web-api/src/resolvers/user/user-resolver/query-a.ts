import { FriendRequest, StringTransform } from '@facebluk/domain'
import { UserQL } from '..'
import { ArgsFilterA } from './resolver'
import { Infra } from '@facebluk/infrastructure'

type UserView = Infra.User.MongoDB.Document & {
  pendingFriendRequest?: Infra.FriendRequest.MongoDB.Document
  userRelationship?: Infra.UserRelationship.MongoDB.Document
}

export const queryByFilterA = async (
  requestUserId: string,
  filter: ArgsFilterA,
  mongoDbConn: Infra.MongoDB.Db
): Promise<UserQL | undefined> => {
  const userQueryRes = await mongoDbConn
    .collection<Infra.User.MongoDB.Document>(Infra.User.MongoDB.collectionName)
    .aggregate([
      { $match: { 'aggregate.id': filter.id } },
      {
        $lookup: {
          from: Infra.FriendRequest.MongoDB.collectionName,
          let: { userId: '$aggregate.id' },
          as: 'pendingFriendRequest',
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$status.tag', FriendRequest.pendingStatusTag] },
                    {
                      $or: [
                        {
                          $and: [
                            { $eq: ['$fromUser.id', requestUserId] },
                            { $eq: ['$toUser.id', '$$userId'] },
                          ],
                        },
                        {
                          $and: [
                            { $eq: ['$fromUser.id', '$$userId'] },
                            { $eq: ['$toUser.id', requestUserId] },
                          ],
                        },
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          pendingFriendRequest: { $arrayElemAt: ['$pendingFriendRequest', 0] },
        },
      },
      {
        $lookup: {
          from: Infra.UserRelationship.MongoDB.collectionName,
          let: { userId: '$aggregate.id' },
          as: 'userRelationship',
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    {
                      $and: [
                        { $eq: ['$blockedStatus.fromUserId', '$$userId'] },
                        { $eq: ['$blockedStatus.toUserId', requestUserId] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ['$blockedStatus.fromUserId', requestUserId] },
                        { $eq: ['$blockedStatus.toUserId', '$$userId'] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ['$friendStatus.fromUserId', '$$userId'] },
                        { $eq: ['$friendStatus.toUserId', requestUserId] },
                      ],
                    },
                    {
                      $and: [
                        { $eq: ['$friendStatus.fromUserId', requestUserId] },
                        { $eq: ['$friendStatus.toUserId', '$$userId'] },
                      ],
                    },
                  ],
                },
              },
            },
          ],
        },
      },
      {
        $addFields: {
          userRelationship: { $arrayElemAt: ['$userRelationship', 0] },
        },
      },
    ])
    .toArray()

  if (userQueryRes.length === 0) return undefined

  const user = userQueryRes[0] as UserView
  return {
    id: user.aggregate.id,
    alias: user.alias,
    name: StringTransform.toTitleCase(user.name),
    profilePictureUrl: user.profilePictureUrl,
    relationshipWithUser: {
      isFriend: user.userRelationship?.friendStatus.tag === 'friended',
      pendingFriendRequest: user.pendingFriendRequest && {
        id: user.pendingFriendRequest.aggregate.id,
        isRequestUserReceiver: user.pendingFriendRequest.toUser.id === requestUserId,
      },
    },
  }
}
