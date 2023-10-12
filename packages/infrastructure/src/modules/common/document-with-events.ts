export type DocumentWithEvents = {
  appliedEvents: {
    id: string
    tag: string
    createdAt: Date
    appliedAt: Date
  }[]
}