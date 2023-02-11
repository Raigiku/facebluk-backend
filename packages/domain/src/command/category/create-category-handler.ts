import { BusinessRuleError, ES, INT } from '../../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  ES.Category.validateInputFields(req.id, req.name, req.subCategories)

  const categoryCount = await deps.getCategoriesCount()
  if (categoryCount > 20) throw maxCategoriesCreatedError(req.id)

  const [, createdEvent] = ES.Category.newA(req.name, req.subCategories)

  await deps.processEvent(createdEvent)
}

export type Dependencies = {
  readonly getCategoriesCount: ES.Category.FnGetCount
  readonly processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  id: string
  name: string
  subCategories: ES.Category.SubCategoriesRegistry
}

export const maxCategoriesCreatedError = (requestId: string) =>
  new BusinessRuleError(requestId, 'max categories created')
