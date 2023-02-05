import { ES } from '@facebluk/domain'
import { Pool } from 'pg'
import { aggregateDataFromEventTable, EventTable, eventTableKey } from '.'

export const getCount =
  (pool: Pool): ES.Category.FnGetCount =>
  async () => {
    const { rows } = await pool.query(
      `
        SELECT COUNT(ce.${eventTableKey('aggregate_id')})::int AS count
        FROM ${TABLE_NAME} ce
        WHERE (ce.${eventTableKey('data')}->>'tag') = $1;
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

    let category: ES.Category.Aggregate | undefined = undefined
    for (const row of rows) {
      const event = row as EventTable<Omit<ES.Category.Event, 'data'>>
      if (event.data.tag == 'category-created')
        category = {
          data: aggregateDataFromEventTable(event),
          name: event.data.name,
          subCategories: event.data.subCategories,
        }
      else {
        if (event.data.tag === 'category-replaced')
          category = {
            data: aggregateDataFromEventTable(event),
            name: event.data.name,
            subCategories: event.data.subCategories,
          }
        else throw new Error('invalid event')
      }
    }
    return category
  }

export const TABLE_NAME = 'category_event'
