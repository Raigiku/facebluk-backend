import {
  FriendRequest,
  Pagination,
  StringTransform,
  UserRelationship,
} from '@facebluk/domain'
import { UserQL } from '..'
import { SharedContext } from '../../../shared-context'
import { ArgsFilterA } from './resolver'
import { Infra } from '@facebluk/infrastructure'

type UserView = Infra.User.MongoDB.Document & {
  pendingFriendRequest?: Infra.FriendRequest.MongoDB.Document
  userRelationship?: Infra.UserRelationship.MongoDB.Document
}

export type UserTextSearchData = {
  readonly userId: string
  readonly createdAt: Date
  readonly alias: string
  readonly name: string
}

export const queryByFilterA = async (
  filter: ArgsFilterA,
  pagination: Pagination.Request,
  context: SharedContext
): Promise<Pagination.Response<UserQL>> => {
  const blockedRelationships = await findBlockedRelationships(
    context.requestUserId,
    context.mongoDbConn
  )
  const blockedUserIds = mapBlockedRelationshipsToUserIds(
    context.requestUserId,
    blockedRelationships
  )
  const foundUsers = await textSearchUsers(
    filter.searchQuery,
    blockedUserIds,
    pagination,
    context.elasticSearchConn
  )
  const foundUserIds = foundUsers.data.map((x) => x.userId)
  const users = await addRelationshipWithSearchedUsers(
    foundUserIds,
    context.requestUserId,
    context.mongoDbConn
  )

  return {
    nextPage: foundUsers.nextPage,
    data: users.map((user) => ({
      id: user.aggregate.id,
      alias: user.alias,
      name: StringTransform.toTitleCase(user.name),
      profilePictureUrl: user.profilePictureUrl,
      relationshipWithUser: {
        isFriend: user.userRelationship?.friendStatus.tag === 'friended',
        pendingFriendRequest: user.pendingFriendRequest && {
          id: user.pendingFriendRequest.aggregate.id,
          isRequestUserReceiver: user.pendingFriendRequest.toUser.id === context.requestUserId,
        },
      },
    })),
  }
}

const findBlockedRelationships = (
  requestUserId: string,
  mongoDbConn: Infra.MongoDB.Db
): Promise<
  Infra.UserRelationship.MongoDB.Document[]
> => {
  return mongoDbConn
    .collection<
      Infra.UserRelationship.MongoDB.Document
    >(Infra.UserRelationship.MongoDB.collectionName)
    .find({
      'blockedStatus.tag': UserRelationship.blockedTag,
      $or: [
        { 'blockedStatus.fromUserId': requestUserId },
        { 'blockedStatus.toUserId': requestUserId },
        { 'friendStatus.fromUserId': requestUserId },
        { 'friendStatus.toUserId': requestUserId },
      ],
    })
    .toArray()
}

const mapBlockedRelationshipsToUserIds = (
  requestUserId: string,
  relationships: Infra.UserRelationship.MongoDB.Document[]
): string[] => {
  const blockedUserIds: string[] = []
  for (const blockedRelationship of relationships) {
    if (blockedRelationship.blockedStatus.tag === 'blocked') {
      const userIdToAdd =
        blockedRelationship.blockedStatus.fromUserId != requestUserId
          ? blockedRelationship.blockedStatus.fromUserId
          : blockedRelationship.blockedStatus.toUserId
      blockedUserIds.push(userIdToAdd)
    }
  }
  return blockedUserIds
}

const textSearchUsers = async (
  searchQuery: string,
  blockedUserIds: string[],
  pagination: Pagination.Request,
  elasticSearchConn: Infra.ElasticSearch.Client
): Promise<Pagination.Response<UserTextSearchData>> => {
  const result = await elasticSearchConn.search<Infra.User.ElasticSeach.Document>({
    index: Infra.User.ElasticSeach.indexName,
    from: Pagination.getOffset(pagination),
    size: pagination.pageSize + 1,
    query: {
      bool: {
        must: {
          query_string: {
            fields: ['name', 'alias'],
            query: `*${searchQuery}*`,
          },
        },
        must_not: {
          terms: {
            _id: blockedUserIds,
          },
        },
      },
    },
  })
  return {
    nextPage: Pagination.getNextPage(result.hits.hits.length, pagination),
    data: result.hits.hits.slice(0, pagination.pageSize).map((x) => ({
      userId: x._id,
      createdAt: x._source!.createdAt,
      alias: x._source!.alias,
      name: x._source!.name,
    })),
  }
}

const addRelationshipWithSearchedUsers = async (
  foundUserIds: string[],
  requestUserId: string,
  mongoDbConn: Infra.MongoDB.Db
): Promise<UserView[]> => {
  const result = await mongoDbConn
    .collection<Infra.User.MongoDB.Document>(Infra.User.MongoDB.collectionName)
    .aggregate([
      {
        $match: {
          'aggregate.id': { $in: foundUserIds },
        },
      },
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

  return result as UserView[]
}
