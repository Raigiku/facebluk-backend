export namespace Pagination {
  export type Request = {
    readonly page: number
    readonly pageSize: number
  }

  export type Response<T> = {
    readonly nextPage?: number
    readonly data: T[]
  }

  export const getOffset = (pagination: Request) => (pagination.page - 1) * pagination.pageSize

  export const getNextPage = (dataLength: number, pagination: Request) =>
    dataLength > pagination.pageSize ? pagination.page + 1 : undefined
}
