export const serialize = (data: object): string =>
  JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? `BIGINT::${value}` : value))

export const deserialize = (json: string) =>
  JSON.parse(json, (_, value) => {
    if (typeof value === 'string' && value.startsWith('BIGINT::')) {
      return BigInt(value.substring(8))
    }
    return value
  })
