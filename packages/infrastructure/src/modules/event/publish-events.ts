import { Event, Logger } from '@facebluk/domain'
import { Common } from '@facebluk/infra-common'
import amqp from 'amqplib'
import { PoolClient } from 'pg'
import { markEventPublished } from '.'
import { sendBrokerMsg } from './send-broker-msg'

export const publishEvents =
  (channel: amqp.Channel, pgClient: PoolClient, log: Logger.FnLog): Event.FnPublishEvents =>
    async (requestId: string, events: Event.AnyEvent[], userId?: string) => {
      for (const event of events) {
        try {
          await sendBrokerMsg(channel, requestId, event.payload.tag, event)
          await markEventPublished(pgClient, event)
        } catch (error) {
          if (error instanceof Error)
            log('error', requestId, 'failed to process event', userId, error)
        }
      }
    }
