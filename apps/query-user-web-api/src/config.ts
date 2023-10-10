export type Config = {
  port: number
  consumerUrl: string
}

export namespace Config {
  export const create = (): Config => ({
    port: Number(process.env.QUERY_USER_WEB_API_PORT!),
    consumerUrl: process.env.QUERY_USER_WEB_API_CONSUMER_URL!,
  })
}
