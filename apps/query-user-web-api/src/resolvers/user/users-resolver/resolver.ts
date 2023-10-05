import { Pagination } from '@facebluk/domain'
import { GraphQLResolveInfo } from 'graphql'
import { UserQL } from '..'
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
  searchQuery: string
}

export type ArgsFilterB = {
  placeholder: boolean
}

export const usersResolver = (
  _: never,
  args: Args,
  context: SharedContext,
  info: GraphQLResolveInfo
): Promise<Pagination.Response<UserQL>> => {
  if (args.filter.a !== undefined) return queryByFilterA(args.filter.a, args.pagination, context)
  else if (args.filter.b !== undefined)
    return queryByFilterB(args.filter.b, args.pagination, context)
  else return Promise.resolve({ data: [] })
}
