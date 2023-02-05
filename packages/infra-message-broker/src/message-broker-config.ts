export type Data = {
  connectionString: string
}

export const newA = (): Data => ({
  connectionString: process.env.MSG_BROKER_CONNECTION_STRING!,
})
