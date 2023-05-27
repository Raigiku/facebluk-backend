export const serialize = (data: object): string =>
  JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? `BIGINT::${value}` : value))

export const deserialize = <T>(json: string): T =>
  JSON.parse(json, (_, value) => {
    if (typeof value === 'string' && value.startsWith('BIGINT::')) return BigInt(value.substring(8))
    if (
      typeof value === 'string' &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    )
      return new Date(value)
    return value
  })
