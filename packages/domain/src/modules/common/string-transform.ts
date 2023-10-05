export namespace StringTransform {
  export const toTitleCase = (value: string) =>
    value
      .toLowerCase()
      .split(' ')
      .map((word) => word.replace(word[0], word[0].toUpperCase()))
      .join(' ')
}
