import amqp, { Channel, Connection, ConsumeMessage, Message } from 'amqplib'

export type Config = {
  connectionString: string
}

export const createConfig = (): Config => ({
  connectionString: process.env.RABBITMQ_CONNECTION_STRING!,
})

export const connect = (config: Config) => amqp.connect(config.connectionString)

export { Channel, Connection, ConsumeMessage, Message }
