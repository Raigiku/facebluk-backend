import { Infra } from '@facebluk/infrastructure'
import dotenv from 'dotenv'
import { queues } from './consumer'
import { FnLog } from '@facebluk/domain'

const main = async () => {
  dotenv.config()

  const commonConfig = Infra.Common.createConfig()
  const log = Infra.Common.createLogFn(commonConfig.environment)

  const rabbitChannel = await setupRabbitMq(log)
  const supabaseClient = setupSupabase(log)
  const pgPool = await setupPostgreSQL(log)

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
      queues[queueName].consumer(rabbitChannel, supabaseClient, pgPool, log),
      {
        noAck: false,
      }
    )
    log('info', '', `RabbitMQ: queue ${queueName} consumer created`)
  }
}

const setupRabbitMq = async (log: FnLog) => {
  let rabbitConn: Infra.RabbitMQ.Connection
  try {
    rabbitConn = await Infra.RabbitMQ.connect(Infra.RabbitMQ.createConfig())
  } catch (error) {
    throw new Error('RabbitMQ: could not connect', { cause: error })
  }
  log('info', '', 'RabbitMQ: connection established')

  let rabbitChannel: Infra.RabbitMQ.Channel
  try {
    rabbitChannel = await rabbitConn.createChannel()
  } catch (error) {
    throw new Error('RabbitMQ: could create channel', { cause: error })
  }
  log('info', '', 'RabbitMQ: channel created')

  return rabbitChannel
}

const setupSupabase = (log: FnLog) => {
  let supabaseClient: Infra.Supabase.SupabaseClient
  try {
    supabaseClient = Infra.Supabase.createClient(Infra.Supabase.createConfig())
  } catch (error) {
    throw new Error('Supabase: could not create client', { cause: error })
  }
  log('info', '', 'Supabase: client created')
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
  log('info', '', 'PostgreSQL: pool connected')
  return pgPool
}

main()
  .then()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
