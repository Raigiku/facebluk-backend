import { BusinessRuleError, ES, INT } from '../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  const categoryCount = await deps.getCategoriesCount()
  if (categoryCount > 20) throw maxCategoriesCreatedError(req.requestId)

  const [, createdEvent] = ES.Category.newA(req.requestId, req.name, req.subCategories, ES.Category.validate)

  await deps.processEvent(createdEvent)
}

export type Dependencies = {
  readonly getCategoriesCount: ES.Category.FnGetCount
  readonly processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  requestId: string
  name: string
  subCategories: ES.Category.SubCategoriesRegistry
}

export const maxCategoriesCreatedError = (requestId: string) =>
  new BusinessRuleError(requestId, 'max categories created')
