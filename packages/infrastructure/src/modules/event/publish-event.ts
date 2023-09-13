import { Event } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import amqp from 'amqplib'
import { PoolClient } from 'pg'
import { determineTableName, eventTableKey } from '.'

export const publishEvent =
  (channel: amqp.Channel, pgClient: PoolClient): Event.FnPublishEvent =>
  async (requestId: string, event: Event.AnyEvent) => {
    await sendEventInBroker(channel, requestId, event)
    await updateEventInDbAsPublished(pgClient, event)
  }

const sendEventInBroker = async (
  channel: amqp.Channel,
  requestId: string,
  event: Event.AnyEvent
) => {
  const exchange = event.payload.tag
  await channel.assertExchange(exchange, 'fanout', { durable: true })
  channel.publish(exchange, '', Buffer.from(Common.JsonSerializer.serialize(event)), {
    persistent: true,
    messageId: requestId,
  })
}

const updateEventInDbAsPublished = async (pgClient: PoolClient, event: Event.AnyEvent) => {
  await pgClient.query(
    `
    UPDATE ${determineTableName(event)}
    SET ${eventTableKey('published')} = true
    WHERE ${eventTableKey('aggregate_id')} = $1 AND
      ${eventTableKey('aggregate_version')} = $2
  `,
    [event.data.aggregateId, event.data.aggregateVersion]
  )
}
