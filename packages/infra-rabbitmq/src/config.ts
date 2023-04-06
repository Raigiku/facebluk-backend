export type Data = {
  connectionString: string
}

export const create = (): Data => ({
  connectionString: process.env.MSG_BROKER_CONNECTION_STRING!,
})
