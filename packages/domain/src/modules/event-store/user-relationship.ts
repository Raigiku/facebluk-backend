import { ES } from '..'

export type AggregateData = {
  readonly data: ES.Aggregate.Data
  readonly fromUserId: string
  readonly toUserId: string
}

export type BlockAggregate = AggregateData & {
  readonly blockedAt: Date
}

export const newA = () => {}
