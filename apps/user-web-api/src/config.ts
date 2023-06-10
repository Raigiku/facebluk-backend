export type Data = {
  port: number
  consumerUrl: string
}

export const create = (): Data => ({
  port: Number(process.env.USER_WEB_API_PORT!),
  consumerUrl: process.env.USER_WEB_API_CONSUMER_URL!,
})
