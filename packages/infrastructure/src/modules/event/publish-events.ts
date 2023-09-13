import { Event, Logger } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import amqp from 'amqplib'
import { PoolClient } from 'pg'
import { determineTableName, eventTableKey } from '.'

export const publishEvents =
  (channel: amqp.Channel, pgClient: PoolClient, log: Logger.FnLog): Event.FnPublishEvents =>
  async (requestId: string, events: Event.AnyEvent[], userId?: string) => {
    for (const event of events) {
      try {
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
      } catch (error) {
        if (error instanceof Error)
          log('error', requestId, 'failed to process event', userId, error)
      }
    }
  }
