import { ApolloServer } from '@apollo/server'
import fastifyApollo, { fastifyApolloDrainPlugin } from '@as-integrations/fastify'
import fastifyCors from '@fastify/cors'
import * as dotenv from 'dotenv'
import Fastify, { FastifyPluginCallback } from 'fastify'
import fs from 'fs'
import { Config } from './config'
import { Infra } from '@facebluk/infrastructure'
import { graphqlResolvers } from './resolvers'
import { SharedContext, initContext } from './shared-context'

const typeDefs = fs.readFileSync('./apps/query-user-web-api/graph-schema.gql').toString()

const main = async () => {
  dotenv.config()

  // setup connections and configs
  const webApiConfig = Config.create()
  const commonConfig = Infra.Common.createConfig()
  const supabaseConfig = Infra.Supabase.createConfig()

  const mongoConfig = Infra.MongoDB.createConfig()
  const mongoClient = Infra.MongoDB.createClient(mongoConfig)
  // check mongo connection
  try {
    await mongoClient.connect()
  } catch (error) {
    throw new Error('MongoDB: could not connect', { cause: error })
  }
  const mongoConn = mongoClient.db(mongoConfig.databaseName)

  const elasticConfig = Infra.ElasticSearch.createConfig()
  const elasticSearchConn = Infra.ElasticSearch.createClient(elasticConfig)
  // check elastic search connection
  try {
    await elasticSearchConn.ping()
  } catch (error) {
    throw new Error('ElasticSearch: could not connect', { cause: error })
  }

  const redisConfig = Infra.Redis.createConfig()
  // check redis connection
  const redisConn = Infra.Redis.createClient(redisConfig)
  try {
    await redisConn.connect()
    await redisConn.ping()
  } catch (error) {
    throw new Error('Redis: could not connect', { cause: error })
  }

  // setup server
  const server = Fastify()
  await server.register(healthCheckRoute)

  const apollo = new ApolloServer<SharedContext>({
    typeDefs,
    introspection: commonConfig.environment !== 'production',
    resolvers: graphqlResolvers,
    formatError: (formattedError, error) => {
      console.error(error)
      return formattedError
    },
    plugins: [fastifyApolloDrainPlugin(server)],
  })

  await apollo.start()

  await server.register(fastifyCors, {
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
    credentials: true,
  })
  await server.register(fastifyApollo(apollo), {
    path: '/api',
    context: initContext(
      mongoConn,
      elasticSearchConn,
      commonConfig,
      supabaseConfig,
      redisConn
    ),
  })

  await server.listen({
    port: webApiConfig.port,
  })
  console.log(`${process.pid} 🚀 Server ready at localhost:${webApiConfig.port}`)
}

main()
  .then()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

const healthCheckRoute: FastifyPluginCallback = (fastify, options, done) => {
  fastify.get('/api/health-check', async (request, reply) => {
    await reply.status(200).send({ response: 'success' })
  })
  done()
}
