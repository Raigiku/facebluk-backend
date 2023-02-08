import { ES } from '@facebluk/domain'
import { Pool } from 'pg'
import { EventTable, eventTableKey, initAggregateDataFromEventTable } from '.'

export const TABLE_NAME = 'category_event'

export const getCount =
  (pool: Pool): ES.Category.FnGetCount =>
  async () => {
    const { rows } = await pool.query(
      `
        SELECT COUNT(ce.${eventTableKey('aggregate_id')})::int AS count
        FROM ${TABLE_NAME} ce
        WHERE (ce.${eventTableKey('payload')}->>'tag') = $1;
      `,
      [ES.Category.CATEGORY_CREATED]
    )
    return rows[0].count
  }

export const get =
  (pool: Pool): ES.Category.FnGet =>
  async (id: string) => {
    const { rows } = await pool.query(
      `
        SELECT *
        FROM ${TABLE_NAME} ce
        WHERE ce.${eventTableKey('aggregate_id')} = $1
        ORDER BY ce.${eventTableKey('aggregate_version')} ASC
      `,
      [id]
    )

    let category: ES.Category.DefaultAggregate | undefined = undefined
    for (const row of rows) {
      const event = row as EventTable
      if (event.payload.tag === 'category-created')
        category = {
          data: initAggregateDataFromEventTable(event),
          name: event.payload.name,
          subCategories: event.payload.subCategories,
        }
      else if (event.payload.tag === 'category-replaced')
        category = {
          data: { ...category!.data, version: event.aggregate_version },
          name: event.payload.name,
          subCategories: event.payload.subCategories,
        }
      else throw new Error('invalid event')
    }
    return category
  }
