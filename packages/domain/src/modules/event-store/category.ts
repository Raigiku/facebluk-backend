import { BusinessRuleError, ES, TaggedType } from '..'

export type DefaultAggregate = {
  readonly data: ES.Aggregate.Data
  readonly name: string
  readonly subCategories: SubCategoriesRegistry
}
export type SubCategoriesRegistry = {
  [key: string]: { name: string; subCategories: string[] }
}

export const newA = (name: string, subCategories: SubCategoriesRegistry): [DefaultAggregate, CreatedEvent] => {
  const aggregateData = ES.Aggregate.newA()
  return [
    {
      data: aggregateData,
      name,
      subCategories,
    },
    {
      data: ES.Event.newA(aggregateData),
      payload: {
        tag: CATEGORY_CREATED,
        name,
        subCategories,
      },
    },
  ]
}
export const replace = (
  aggregate: DefaultAggregate,
  name: string,
  subCategories: SubCategoriesRegistry
): [DefaultAggregate, ReplacedEvent] => {
  const updatedAggregateData = ES.Aggregate.increaseVersion(aggregate.data)
  return [
    {
      data: updatedAggregateData,
      name,
      subCategories,
    },
    {
      data: ES.Event.newA(updatedAggregateData),
      payload: {
        tag: CATEGORY_REPLACED,
        name,
        subCategories,
      },
    },
  ]
}

// events
export type Event = CreatedEvent | ReplacedEvent

export const CATEGORY_CREATED = 'category-created'
export type CreatedEventPayload = TaggedType<typeof CATEGORY_CREATED> & {
  readonly name: string
  readonly subCategories: SubCategoriesRegistry
}
export type CreatedEvent = {
  readonly data: ES.Event.Data
  readonly payload: CreatedEventPayload
}

export const CATEGORY_REPLACED = 'category-replaced'
export type ReplacedEventPayload = TaggedType<typeof CATEGORY_REPLACED> & {
  readonly name: string
  readonly subCategories: SubCategoriesRegistry
}
export type ReplacedEvent = {
  readonly data: ES.Event.Data
  readonly payload: ReplacedEventPayload
}

// validation
export const validateInputFields = (requestId: string, name: string, subCategories: SubCategoriesRegistry) => {
  validateName(requestId, name)
  for (const key in subCategories) {
    const subCategory = subCategories[key]
    validateName(requestId, subCategory.name)
    if (subCategory.subCategories.length > MAX_SUBCATEGORIES)
      throw categoryExceedsSubCategoryMaxAmountError(requestId, name)
  }
}

export const validateName = (requestId: string, name: string) => {
  if (name.length > NAME_MAX_LENGTH) throw nameLongerThanMaxLengthError(requestId)
  if (name.length === 0) throw nameCannotBeEmptyError(requestId)
}

export const categoryExceedsSubCategoryMaxAmountError = (requestId: string, name: string) =>
  new BusinessRuleError(requestId, `${name} cannot have more than 5 subcategories`)

export const nameLongerThanMaxLengthError = (requestId: string) =>
  new BusinessRuleError(requestId, `name cannot be longer than ${NAME_MAX_LENGTH} characters`)

export const nameCannotBeEmptyError = (requestId: string) => new BusinessRuleError(requestId, 'name cannot be empty')

export const NAME_MAX_LENGTH = 30
export const MAX_SUBCATEGORIES = 5

// accessors
export type FnGetCount = () => Promise<number>
export type FnGet = (id: string) => Promise<DefaultAggregate | undefined>
export type FnPersistEvent = (event: Event) => Promise<void>
export type FnMarkEventAsSent = (event: Event) => Promise<void>
