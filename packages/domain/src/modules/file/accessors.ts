export namespace AuthQueries {
  export type GenerateFileUrl = (bucket: string, path: string) => string
}

export namespace Mutations {
  export type Upload = (
    bucket: string,
    path: string,
    bytes: ArrayBuffer,
    fileType: string
  ) => Promise<void>
}
