import { ApolloFastifyContextFunction } from '@as-integrations/fastify'
import { Infra } from '@facebluk/infrastructure'
import { GraphQLError } from 'graphql'
import jwt from 'jsonwebtoken'

export type SharedContext = {
  mongoDbConn: Infra.MongoDB.Db
  elasticSearchConn: Infra.ElasticSearch.Client
  requestUserId: string
}

const notAuthenticatedError = new GraphQLError('User is not authenticated', {
  extensions: {
    code: 'UNAUTHENTICATED',
    http: { status: 401 },
  },
})

export const initContext =
  (
    mongoDbConn: Infra.MongoDB.Db,
    elasticSearchConn: Infra.ElasticSearch.Client,
    commonConfig: Infra.Common.Config,
    supabaseConfig: Infra.Supabase.Config
  ): ApolloFastifyContextFunction<SharedContext> =>
  ({ headers }) => {
    let authToken = headers.authorization ?? ''
    // split for Bearer xxxxxx
    const splitToken = authToken.split(' ')
    if (splitToken.length > 1) authToken = splitToken[1]

    let requestUserId: string
    try {
      const jwtModel = jwt.verify(authToken, supabaseConfig.supabaseJwtSecret)
      requestUserId = jwtModel.sub!.toString()
    } catch (error) {
      if (commonConfig.environment === 'production') throw notAuthenticatedError
      else requestUserId = authToken
    }

    return Promise.resolve({
      requestUserId,
      mongoDbConn,
      elasticSearchConn,
    })
  }
