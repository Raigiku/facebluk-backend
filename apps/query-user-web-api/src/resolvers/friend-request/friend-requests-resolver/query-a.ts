import { Infra } from '@facebluk/infrastructure'
import { FriendRequest, Pagination, StringTransform } from '@facebluk/domain'
import { FriendRequestQL } from '..'

export const queryByFilterA = async (
  requestUserId: string,
  pagination: Pagination.Request,
  mongoDbConn: Infra.MongoDB.Db
): Promise<Pagination.Response<FriendRequestQL>> => {
  const friendRequests = await mongoDbConn
    .collection<Infra.FriendRequest.MongoDB.Document>(
      Infra.FriendRequest.MongoDB.collectionName
    )
    .find({
      'status.tag': FriendRequest.pendingStatusTag,
      $or: [{ 'fromUser.id': requestUserId }, { 'toUser.id': requestUserId }],
    })
    .sort({ 'aggregate.createdAt': -1 })
    .skip(Pagination.getOffset(pagination))
    .limit(pagination.pageSize + 1)
    .toArray()

  return {
    nextPage: Pagination.getNextPage(friendRequests.length, pagination),
    data: friendRequests.slice(0, pagination.pageSize).map((x) => ({
      id: x.aggregate.id,
      createdAt: x.aggregate.createdAt,
      status: x.status.tag,
      fromUser: { ...x.fromUser, name: StringTransform.toTitleCase(x.fromUser.name) },
      toUser: { ...x.toUser, name: StringTransform.toTitleCase(x.toUser.name) },
    })),
  }
}
