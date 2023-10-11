import { InfluxDB, WriteApi, QueryApi } from '@influxdata/influxdb-client'

export type Config = {
  url: string
  apiToken: string
}

export const createConfig = (): Config => ({
  apiToken: process.env.INFLUXDB_API_TOKEN!,
  url: process.env.INFLUXDB_URL!,
})

export const createClients = (config: Config): [WriteApi, QueryApi] => {
  const options = new InfluxDB({ url: config.url, token: config.apiToken })
  return [options.getWriteApi('facebluk', 'logs'), options.getQueryApi('facebluk')]
}

export { WriteApi, QueryApi }