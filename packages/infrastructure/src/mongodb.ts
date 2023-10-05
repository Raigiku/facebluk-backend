import { MongoClient, Db } from 'mongodb'

export type Config = {
  connectionString: string
  databaseName: string
}

export const createConfig = (): Config => ({
  connectionString: process.env.MONGODB_CONNECTION_STRING!,
  databaseName: 'facebluk',
})

export const createClient = (config: Config) => {
  return new MongoClient(config.connectionString)
}

export { Db }
