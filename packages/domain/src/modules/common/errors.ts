export class BusinessRuleError extends Error {
  constructor(readonly requestId: string, msg: string) {
    super(msg)
    Object.setPrototypeOf(this, BusinessRuleError.prototype)
  }
}

export class DuplicateEventError extends Error {
  constructor() {
    super()
    Object.setPrototypeOf(this, DuplicateEventError.prototype)
  }
}
