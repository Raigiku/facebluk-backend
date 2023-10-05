import { Pagination, StringTransform } from '@facebluk/domain'
import { PostQL } from '..'
import { SharedContext } from '../../../shared-context'
import { ArgsFilterB } from './resolver'
import { Infra } from '@facebluk/infrastructure'

type PostView = Infra.Post.MongoDB.Document & {
  user: Infra.User.MongoDB.Document
}

export const queryByFilterB = async (
  filter: ArgsFilterB,
  pagination: Pagination.Request,
  context: SharedContext
): Promise<Pagination.Response<PostQL>> => {
  const postResults = (await context.mongoDbConn
    .collection<Infra.Post.MongoDB.Document>(Infra.Post.MongoDB.collectionName)
    .aggregate([
      {
        $match: {
          userId: filter.userId,
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
