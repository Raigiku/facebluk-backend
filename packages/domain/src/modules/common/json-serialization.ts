export const jsonDeserialize = (str: string) => {
  return JSON.parse(str, (key, value) => {
    if (typeof value === 'string') {
      const parsedDate = Date.parse(value);
      if (!isNaN(parsedDate))
        return new Date(value)
    }
    return value
  })
}