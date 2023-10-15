import dotenv from 'dotenv'
import { CronJob } from 'cron'
import { removeCachedPostsJob } from './jobs'
import { FnLog } from '@facebluk/domain'
import { Infra } from '@facebluk/infrastructure'

const main = async () => {
  dotenv.config()

  const commonConfig = Infra.Common.createConfig()
  const influxDbClients = await setupInfluxDb()
  const log = Infra.Common.createLogFn(commonConfig.environment, influxDbClients[0])
  const redisClient = await setupRedis(log)

  new CronJob(
    '0 0 * * * *',
    async () => {
      await removeCachedPostsJob(redisClient)
    },
    null,
    true,
    'Etc/GMT'
  )
}

main()
  .then()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

const setupRedis = async (log: FnLog) => {
  const redisConfig = Infra.Redis.createConfig()
  let redisClient: Infra.Redis.RedisClientType
  try {
    redisClient = Infra.Redis.createClient(redisConfig)
    await redisClient.connect()
    await redisClient.ping()
  } catch (error) {
    throw new Error('Reedis: could not connect', { cause: error })
  }
  await log('info', '', 'Redis: db connected')

  return redisClient
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