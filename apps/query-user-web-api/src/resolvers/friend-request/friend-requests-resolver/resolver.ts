import { Pagination } from '@facebluk/domain'
import { GraphQLResolveInfo } from 'graphql'
import { FriendRequestQL } from '..'
import { SharedContext } from '../../../shared-context'
import { queryByFilterA } from './query-a'

type Args = {
  filter: {
    a?: { placeholder: boolean }
  }
  pagination: Pagination.Request
}

export const friendRequestsResolver = (
  _: never,
  args: Args,
  context: SharedContext,
  info: GraphQLResolveInfo
): Promise<Pagination.Response<FriendRequestQL>> => {
  if (args.filter.a !== undefined)
    return queryByFilterA(context.requestUserId, args.pagination, context.mongoDbConn)
  else return Promise.resolve({ data: [] })
}
