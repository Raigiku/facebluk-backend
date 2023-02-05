import { BusinessRuleError, ES, TaggedType } from '..';

export type SubCategoriesRegistry = {
  [key: string]: { name: string; subCategories: string[] }
}

export type Aggregate = {
  readonly data: ES.Aggregate.Data
  readonly name: string
  readonly subCategories: SubCategoriesRegistry
}

export const newA = (
  requestId: string,
  name: string,
  subCategories: SubCategoriesRegistry,
  validate: FnValidate
): [Aggregate, CreatedEvent] => {
  const aggregateData = ES.Aggregate.newA(requestId, ES.Aggregate.validate)
  return [
    validate(requestId, {
      data: aggregateData,
      name: name,
      subCategories: subCategories,
    }),
    {
      tag: CATEGORY_CREATED,
      data: ES.Event.newA(aggregateData),
      name: name,
      subCategories: subCategories,
    },
  ]
}

export const replace = (
  requestId: string,
  aggregate: Aggregate,
  name: string,
  subCategories: SubCategoriesRegistry,
  validate: FnValidate
): [Aggregate, ReplacedEvent] => {
  const updatedAggregateData = ES.Aggregate.increaseVersion(requestId, aggregate.data, ES.Aggregate.validate)
  return [
    validate(requestId, {
      data: updatedAggregateData,
      name: name,
      subCategories: subCategories,
    }),
    {
      tag: CATEGORY_REPLACED,
      data: ES.Event.newA(updatedAggregateData),
      name: name,
      subCategories: subCategories,
    },
  ]
}

// events
export type Event = CreatedEvent | ReplacedEvent

export const CATEGORY_CREATED = 'category-created'

export type CreatedEvent = TaggedType<typeof CATEGORY_CREATED> & {
  readonly data: ES.Event.Data
  readonly name: string
  readonly subCategories: SubCategoriesRegistry
}

export const CATEGORY_REPLACED = 'category-replaced'

export type ReplacedEvent = TaggedType<typeof CATEGORY_REPLACED> & {
  readonly data: ES.Event.Data
  readonly name: string
  readonly subCategories: SubCategoriesRegistry
}

// validation
export type FnValidate = (requestId: string, aggregate: Aggregate) => Aggregate

export const validate = (requestId: string, aggregate: Aggregate): Aggregate => {
  validateName(requestId, aggregate.name)
  for (const key in aggregate.subCategories) {
    const { name, subCategories } = aggregate.subCategories[key]
    validateName(requestId, name)
    if (subCategories.length > MAX_SUBCATEGORIES) throw categoryExceedsSubCategoryMaxAmountError(requestId, name)
  }
  return aggregate
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
export type FnGet = (id: string) => Promise<ES.Category.Aggregate | undefined>
export type FnPersistEvent = (event: ES.Category.Event) => Promise<void>
export type FnMarkEventAsSent = (event: ES.Category.Event) => Promise<void>
