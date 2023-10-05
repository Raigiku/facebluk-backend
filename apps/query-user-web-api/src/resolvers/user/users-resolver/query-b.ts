import { Pagination, StringTransform, UserRelationship } from '@facebluk/domain'
import { UserQL } from '..'
import { SharedContext } from '../../../shared-context'
import { ArgsFilterB } from './resolver'
import { Infra } from '@facebluk/infrastructure'

type UserView = Infra.UserRelationship.MongoDB.Document & {
  friend: Infra.User.MongoDB.Document
}

export const queryByFilterB = async (
  filter: ArgsFilterB,
  pagination: Pagination.Request,
  context: SharedContext
): Promise<Pagination.Response<UserQL>> => {
  const users = (await context.mongoDbConn
    .collection<
      Infra.UserRelationship.MongoDB.Document
    >(Infra.UserRelationship.MongoDB.collectionName)
    .aggregate([
      {
        $match: {
          'friendStatus.tag': UserRelationship.friendedStatusTag,
          $or: [
            { 'friendStatus.fromUserId': context.requestUserId },
            { 'friendStatus.toUserId': context.requestUserId },
          ],
        },
      },
      {
        $addFields: {
          friendUserId: {
            $cond: {
              if: { $ne: ['$friendStatus.fromUserId', context.requestUserId] },
              then: '$friendStatus.fromUserId',
              else: '$friendStatus.toUserId',
            },
          },
        },
      },
      {
        $lookup: {
          from: Infra.User.MongoDB.collectionName,
          foreignField: 'aggregate.id',
          localField: 'friendUserId',
          as: 'friend',
        },
      },
      {
        $addFields: {
          friend: { $arrayElemAt: ['$friend', 0] },
        },
      },
      { $sort: { 'friend.name': 1 } },
      { $skip: Pagination.getOffset(pagination) },
      { $limit: pagination.pageSize + 1 },
    ])
    .toArray()) as UserView[]

  return {
    nextPage: Pagination.getNextPage(users.length, pagination),
    data: users.slice(0, pagination.pageSize).map((x) => ({
      id: x.friend.aggregate.id,
      alias: x.friend.alias,
      name: StringTransform.toTitleCase(x.friend.name),
      profilePictureUrl: x.friend.profilePictureUrl,
      relationshipWithUser: {
        isFriend: true,
        pendingFriendRequest: undefined,
      },
    })),
  }
}
