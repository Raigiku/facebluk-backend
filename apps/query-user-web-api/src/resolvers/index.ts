import { friendRequestsResolver } from './friend-request'
import { postsResolver } from './post/posts-resolver/resolver'
import { userResolver, usersResolver } from './user'

export const graphqlResolvers = {
  Query: {
    friendRequests: friendRequestsResolver,
    user: userResolver,
    users: usersResolver,
    posts: postsResolver,
  },
}
