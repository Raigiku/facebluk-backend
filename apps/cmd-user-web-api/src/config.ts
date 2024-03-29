export type Config = {
  port: number
  consumerUrl: string
}

const create = (): Config => ({
  port: Number(process.env.CMD_USER_WEB_API_PORT!),
  consumerUrl: process.env.CMD_USER_WEB_API_CONSUMER_URL!,
})

export const Config = {
  create,
}
