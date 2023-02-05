
// events
export type Event = 2;

// export class CreatedEvent extends TaggedClass<'product-created'> {
//   private constructor(
//     readonly event: ES.Event.Data,
//     readonly name: string,
//     readonly details: string,
//     readonly brand: string,
//     readonly categoryId: string,
//     readonly specifications: Map<string, string>,
//     readonly warranty: string,
//     readonly variations: { fields: Map<string, string>[]; unitPrice: number }[],
//     readonly initialStock: number,
//     readonly makePublic: boolean
//   ) {
//     super('product-created')
//   }

//   // static new(
//   //   name: string,
//   //   details: string,
//   //   brand: string,
//   //   categoryId: string,
//   //   specifications: Map<string, string>,
//   //   warranty: string,
//   //   variations: { fields: Map<string, string>[]; unitPrice: number }[],
//   //   initialStock: number,
//   //   makePublic: boolean
//   // ) {
//   //   return new CreatedEvent(
//   //     ES.Event.Data.new(Uuid.new()),
//   //     name,
//   //     details,
//   //     brand,
//   //     categoryId,
//   //     specifications,
//   //     warranty,
//   //     variations,
//   //     initialStock,
//   //     makePublic
//   //   )
//   // }
// }

// // accessor functions
// export type getIfExistsFn = (id: string) => Promise<boolean>
// export type getCountFn = () => Promise<number>
// export type persistEventFn = (event: Event) => Promise<void>
