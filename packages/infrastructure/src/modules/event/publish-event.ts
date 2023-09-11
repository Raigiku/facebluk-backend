import { EventData } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import amqp from 'amqplib'
import { PoolClient } from 'pg'
import { determineTableName, eventTableKey } from '.'

export const publishEvent =
  (channel: amqp.Channel, pgClient: PoolClient): EventData.FnPublishEvent =>
  async (requestId: string, event: EventData.AnyEvent) => {
    const exchange = event.payload.tag
    await channel.assertExchange(exchange, 'fanout', { durable: true })
    channel.publish(exchange, '', Buffer.from(Common.JsonSerializer.serialize(event)), {
      persistent: true,
      messageId: requestId,
    })

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
