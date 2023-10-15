import { Pagination, StringTransform, UserRelationship, jsonDeserialize } from '@facebluk/domain'
import { PostQL } from '..'
import { SharedContext } from '../../../shared-context'
import { ArgsFilterA } from './resolver'
import { Infra } from '@facebluk/infrastructure'
import { DateTime } from 'luxon'

type MongoPostView = Infra.Post.MongoDB.Document & {
  user: Infra.User.MongoDB.Document
}

type MongoFriendView = Infra.UserRelationship.MongoDB.Document & {
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
    .toArray()) as MongoFriendView[]
  const friendUserIds = friendResults.map((x) => x.friendUserId)

  const paginationOffset = Pagination.getOffset(pagination)
  const twelveHoursAgoInSeconds = DateTime.utc().minus({ hours: 12 }).toSeconds()

  const redisPostsFrom12HoursAgo: Infra.Post.Redis.Value[] = (
    await context.redisConn
      .zRangeByScore(Infra.Post.Redis.keyName, twelveHoursAgoInSeconds, '+inf')
  ).map(x => jsonDeserialize(x))
  const redisPostsFromFriendsOrUser = redisPostsFrom12HoursAgo
    .filter(x => friendUserIds.includes(x.userId) || x.userId === context.requestUserId)

  let redisSelectedPosts: Infra.Post.Redis.Value[] = []
  if (redisPostsFromFriendsOrUser.length > 0) {
    if (redisPostsFromFriendsOrUser.length - 1 >= paginationOffset) {
      redisSelectedPosts = redisPostsFromFriendsOrUser.slice(
        paginationOffset,
        Math.min(redisPostsFromFriendsOrUser.length, paginationOffset + pagination.pageSize)
      )
    }
  }

  const mongoPostResults = (await context.mongoDbConn
    .collection<Infra.Post.MongoDB.Document>(Infra.Post.MongoDB.collectionName)
    .aggregate([
      {
        $match: {
          $or: [{ userId: context.requestUserId }, { userId: { $in: friendUserIds } }],
        },
      },
      { $sort: { 'aggregate.createdAt': -1 } },
      { $skip: paginationOffset },
      { $limit: pagination.pageSize + 1 },
      {
        $match: {
          'aggregate.id': { $nin: redisSelectedPosts.map(x => x.aggregate.id) }
        },
      },
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
    .toArray()) as MongoPostView[]

  let redisPostQL: PostQL[] = []
  if (redisSelectedPosts.length > 0) {
    const usersForCachedPosts = await context.mongoDbConn
      .collection<Infra.User.MongoDB.Document>(Infra.User.MongoDB.collectionName)
      .find({
        'aggregate.id': { $in: redisSelectedPosts.map(x => x.userId) }
      }).toArray()

    redisPostQL = redisSelectedPosts.map<PostQL>(post => {
      const user = usersForCachedPosts.find(user => user.aggregate.id === post.userId)
      return {
        id: post.aggregate.id,
        description: post.description,
        user: {
          id: user!.aggregate.id,
          alias: user!.alias,
          name: user!.name,
          profilePictureUrl: user!.profilePictureUrl
        }
      }
    })
  }

  const mongoPostQL = mongoPostResults.map((x) => ({
    id: x.aggregate.id,
    description: x.description,
    user: {
      id: x.user.aggregate.id,
      name: StringTransform.toTitleCase(x.user.name),
      alias: x.user.alias,
      profilePictureUrl: x.user.profilePictureUrl,
    },
  }))

  return {
    nextPage: Pagination.getNextPage(mongoPostResults.length + redisPostQL.length, pagination),
    data: redisPostQL.concat(mongoPostQL),
  }
}
