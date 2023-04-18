export type Data = {
  connectionString: string
}

export const create = (): Data => ({
  connectionString: process.env.RABBITMQ_CONNECTION_STRING!,
})
