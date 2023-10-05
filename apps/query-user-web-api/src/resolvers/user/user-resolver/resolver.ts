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
}

export type ArgsFilterA = {
  id: string
}

export type ArgsFilterB = {
  alias: string
}

export const userResolver = (
  _: never,
  args: Args,
  context: SharedContext,
  info: GraphQLResolveInfo
): Promise<UserQL | undefined> => {
  if (args.filter.a !== undefined)
    return queryByFilterA(context.requestUserId, args.filter.a, context.mongoDbConn)
  else if (args.filter.b !== undefined)
    return queryByFilterB(context.requestUserId, args.filter.b, context.mongoDbConn)
  else return Promise.resolve(undefined)
}