export const businessRuleErrorResponseSchema = {
  422: {
    description: 'Business rule validation',
    type: 'object',
    properties: {
      requestId: { type: 'string' },
      message: { type: 'string' },
    },
  },
}

export type FormFile = {
  data: Buffer
  filename: string
  encoding: string
  mimetype: string
  type: string
}
