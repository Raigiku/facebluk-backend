import { Infra } from '@facebluk/infrastructure'
import dotenv from 'dotenv'
import { queues } from './consumer'
import { FnLog } from '@facebluk/domain'

const main = async () => {
  dotenv.config()

  const commonConfig = Infra.Common.createConfig()
  const influxDbClients = await setupInfluxDb()
  const log = Infra.Common.createLogFn(commonConfig.environment, influxDbClients[0])

  const rabbitChannel = await setupRabbitMq(log)
  const supabaseClient = await setupSupabase(log)
  const pgPool = await setupPostgreSQL(log)
  const mongoDb = await setupMongoDb(log)
  const redisClient = await setupRedis(log)
  const elasticClient = await setupElasticSearch(log)

  for (const queueName in queues) {
    const deadLetterExchange = `${queues[queueName].exchange}-dlx`
    await rabbitChannel.assertExchange(queues[queueName].exchange, 'fanout', { durable: true })
    await rabbitChannel.assertExchange(deadLetterExchange, 'fanout', { durable: true })

    await rabbitChannel.assertQueue(queueName, { durable: true, deadLetterExchange })
    await rabbitChannel.bindQueue(queueName, queues[queueName].exchange, '')

    const deadLetterQueue = `${queueName}-dlq`
    await rabbitChannel.assertQueue(deadLetterQueue, { durable: true })
    await rabbitChannel.bindQueue(deadLetterQueue, deadLetterExchange, '')

    void rabbitChannel.consume(
      queueName,
      queues[queueName].consumer(
        rabbitChannel,
        supabaseClient,
        pgPool,
        log,
        mongoDb,
        elasticClient,
        redisClient
      ),
      {
        noAck: false,
      }
    )
    await log('info', '', `RabbitMQ: queue ${queueName} consumer created`)
  }
}

const setupElasticSearch = async (log: FnLog) => {
  const elasticConfig = Infra.ElasticSearch.createConfig()
  let elasticClient: Infra.ElasticSearch.Client
  try {
    elasticClient = Infra.ElasticSearch.createClient(elasticConfig)
  } catch (error) {
    throw new Error('ElasticSearch: could not connect', { cause: error })
  }
  await log('info', '', 'ElasticSearch: connected')

  return elasticClient
}

const setupRedis = async (log: FnLog) => {
  const redisConfig = Infra.Redis.createConfig()
  let redisClient: Infra.Redis.RedisClientType
  try {
    redisClient = Infra.Redis.createClient(redisConfig)
    await redisClient.ping()
  } catch (error) {
    throw new Error('Reedis: could not connect', { cause: error })
  }
  await log('info', '', 'Redis: db connected')

  return redisClient
}

const setupMongoDb = async (log: FnLog) => {
  const mongoConfig = Infra.MongoDB.createConfig()
  let mongoDb: Infra.MongoDB.Db
  try {
    const mongoClient = Infra.MongoDB.createClient(mongoConfig)
    mongoDb = mongoClient.db(mongoConfig.databaseName)
  } catch (error) {
    throw new Error('MongoDb: could not connect', { cause: error })
  }
  await log('info', '', 'MongoDb: db connected')

  return mongoDb
}

const setupRabbitMq = async (log: FnLog) => {
  let rabbitConn: Infra.RabbitMQ.Connection
  try {
    rabbitConn = await Infra.RabbitMQ.connect(Infra.RabbitMQ.createConfig())
  } catch (error) {
    throw new Error('RabbitMQ: could not connect', { cause: error })
  }
  await log('info', '', 'RabbitMQ: connection established')

  let rabbitChannel: Infra.RabbitMQ.Channel
  try {
    rabbitChannel = await rabbitConn.createChannel()
  } catch (error) {
    throw new Error('RabbitMQ: could create channel', { cause: error })
  }
  await log('info', '', 'RabbitMQ: channel created')

  return rabbitChannel
}

const setupInfluxDb = async () => {
  let influxDbClients: [Infra.InfluxDB.WriteApi, Infra.InfluxDB.QueryApi]
  try {
    influxDbClients = Infra.InfluxDB.createClients(Infra.InfluxDB.createConfig())
    await influxDbClients[1].queryRaw(`from(bucket: "logs")
      |> range(start: -10m)
      |> filter(fn: (r) => r._measurement == "logs")`
    );
  } catch (error) {
    throw new Error('InfluxDb: could not create clients', { cause: error })
  }
  console.log('info', '', 'InfluxDb: clients established')
  return influxDbClients
}

const setupSupabase = async (log: FnLog) => {
  let supabaseClient: Infra.Supabase.SupabaseClient
  try {
    supabaseClient = Infra.Supabase.createClient(Infra.Supabase.createConfig())
  } catch (error) {
    throw new Error('Supabase: could not create client', { cause: error })
  }
  await log('info', '', 'Supabase: client created')
  return supabaseClient
}

const setupPostgreSQL = async (log: FnLog) => {
  const pgConfig = Infra.PostgreSQL.createConfig()
  let pgPool: Infra.PostgreSQL.Pool
  try {
    pgPool = new Infra.PostgreSQL.Pool({
      host: pgConfig.host,
      database: pgConfig.database,
      user: pgConfig.username,
      password: pgConfig.password,
      port: pgConfig.port,
    })
    await pgPool.connect()
  } catch (error) {
    throw new Error('PostgreSQL: could not connect pool', { cause: error })
  }
  await log('info', '', 'PostgreSQL: pool connected')
  return pgPool
}

main()
  .then()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
