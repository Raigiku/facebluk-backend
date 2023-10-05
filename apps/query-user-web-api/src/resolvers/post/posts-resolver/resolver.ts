import { Pagination } from '@facebluk/domain'
import { GraphQLResolveInfo } from 'graphql'
import { PostQL } from '..'
import { SharedContext } from '../../../shared-context'
import { queryByFilterA } from './query-a'
import { queryByFilterB } from './query-b'

type Args = {
  filter: {
    a?: ArgsFilterA
    b?: ArgsFilterB
  }
  pagination: Pagination.Request
}

export type ArgsFilterA = {
  placeholder: boolean
}

export type ArgsFilterB = {
  userId: string
}

export const postsResolver = (
  _: never,
  args: Args,
  context: SharedContext,
  info: GraphQLResolveInfo
): Promise<Pagination.Response<PostQL>> => {
  if (args.filter.a !== undefined) return queryByFilterA(args.filter.a, args.pagination, context)
  else if (args.filter.b !== undefined)
    return queryByFilterB(args.filter.b, args.pagination, context)
  else return Promise.resolve({ data: [] })
}
