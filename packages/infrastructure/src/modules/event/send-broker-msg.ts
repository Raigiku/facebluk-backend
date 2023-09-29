import { Common } from '@facebluk/infra-common'
import amqp from 'amqplib'

export const sendBrokerMsg =
  (channel: amqp.Channel) => async (messageId: string, exchange: string, body: object) => {
    await channel.assertExchange(exchange, 'fanout', { durable: true })
    channel.publish(exchange, '', Buffer.from(Common.JsonSerializer.serialize(body)), {
      persistent: true,
      messageId,
    })
  }
