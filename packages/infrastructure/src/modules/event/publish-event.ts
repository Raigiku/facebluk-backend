import { Event } from '@facebluk/domain'
import amqp from 'amqplib'
import { PoolClient } from 'pg'
import { markEventPublished, sendBrokerMsg } from '.'

export const publishEvent =
  (channel: amqp.Channel, pgClient: PoolClient): Event.Mutations.PublishEvent =>
  async (event: Event.AnyEvent) => {
    if (event.data.published) return
    await sendBrokerMsg(channel)(event.data.eventId, event.payload.tag, event)
    await markEventPublished(pgClient, event)
  }
