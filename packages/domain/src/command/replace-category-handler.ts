import { BusinessRuleError, ES, INT } from '../modules'

export const handle = async (req: Request, deps: Dependencies) => {
  const foundCategory = await deps.getCategory(req.id)
  if (foundCategory === undefined) throw categoryNotFoundError(req.requestId)

  const [, replacedEvent] = ES.Category.replace(
    req.requestId,
    foundCategory,
    req.name,
    req.subCategories,
    ES.Category.validate
  )

  await deps.processEvent(replacedEvent)
}

export type Dependencies = {
  readonly getCategory: ES.Category.FnGet
  readonly processEvent: INT.Event.FnProcessEvent
}

export type Request = {
  requestId: string
  id: string
  name: string
  subCategories: ES.Category.SubCategoriesRegistry
}

export const categoryNotFoundError = (requestId: string) => new BusinessRuleError(requestId, 'category not found')
