import { MB } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import amqp from 'amqplib'
import * as Config from './config'

export const publishEvent =
  (channel: amqp.Channel): MB.FnPublishMsg =>
  async (requestId: string, exchange: string, msg: object) => {
    await channel.assertExchange(exchange, 'fanout', { durable: true })
    channel.publish(exchange, '', Buffer.from(Common.JsonSerializer.serialize(msg)), {
      persistent: true,
      messageId: requestId,
    })
  }

export { amqp, Config }