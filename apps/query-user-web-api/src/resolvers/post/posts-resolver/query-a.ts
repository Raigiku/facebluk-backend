import { Pagination, StringTransform, UserRelationship } from '@facebluk/domain'
import { PostQL } from '..'
import { SharedContext } from '../../../shared-context'
import { ArgsFilterA } from './resolver'
import { Infra } from '@facebluk/infrastructure'

type PostView = Infra.Post.MongoDB.Document & {
  user: Infra.User.MongoDB.Document
}

type FriendView = Infra.UserRelationship.MongoDB.Document & {
  friendUserId: string
}

export const queryByFilterA = async (
  filter: ArgsFilterA,
  pagination: Pagination.Request,
  context: SharedContext
): Promise<Pagination.Response<PostQL>> => {
  const friendResults = (await context.mongoDbConn
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
    ])
    .toArray()) as FriendView[]

  const friendUserIds = friendResults.map((x) => x.friendUserId)
  const postResults = (await context.mongoDbConn
    .collection<Infra.Post.MongoDB.Document>(Infra.Post.MongoDB.collectionName)
    .aggregate([
      {
        $match: {
          $or: [{ userId: context.requestUserId }, { userId: { $in: friendUserIds } }],
        },
      },
      { $sort: { 'aggregate.createdAt': -1 } },
      { $skip: Pagination.getOffset(pagination) },
      { $limit: pagination.pageSize + 1 },
      {
        $lookup: {
          from: Infra.User.MongoDB.collectionName,
          foreignField: 'aggregate.id',
          localField: 'userId',
          as: 'user',
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ['$user', 0] },
        },
      },
    ])
    .toArray()) as PostView[]

  return {
    nextPage: Pagination.getNextPage(postResults.length, pagination),
    data: postResults.slice(0, pagination.pageSize).map((x) => ({
      id: x.aggregate.id,
      description: x.description,
      user: {
        id: x.user.aggregate.id,
        name: StringTransform.toTitleCase(x.user.name),
        alias: x.user.alias,
        profilePictureUrl: x.user.profilePictureUrl,
      },
    })),
  }
}
