import { MB } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import amqp from 'amqplib'
import * as Config from './message-broker-config'

export const publishEvent =
  (channel: amqp.Channel): MB.FnPublishMsg =>
  async (exchange: string, msg: object) => {
    await channel.assertExchange(exchange, 'fanout', { durable: true })
    channel.publish(exchange, '', Buffer.from(Common.JsonSerializer.serialize(msg)))
  }

export { amqp, Config }

