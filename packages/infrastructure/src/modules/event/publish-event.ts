import { Event } from '@facebluk/domain'
import amqp from 'amqplib'
import { PoolClient } from 'pg'
import { markEventPublished } from '.'
import { sendBrokerMsg } from './send-broker-msg'

export const publishEvent =
  (channel: amqp.Channel, pgClient: PoolClient): Event.FnPublishEvent =>
    async (requestId: string, event: Event.AnyEvent) => {
      await sendBrokerMsg(channel, requestId, event.payload.tag, event)
      await markEventPublished(pgClient, event)
    }