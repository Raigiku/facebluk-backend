export type Data = {
  port: number
  apiUrl: string
  consumerUrl: string
}

export const newA = (): Data => ({
  port: Number(process.env.EXT_USER_WEB_API_PORT!),
  apiUrl: process.env.EXT_USER_WEB_API_URL!,
  consumerUrl: process.env.EXT_USER_WEB_API_CONSUMER_URL!,
})
