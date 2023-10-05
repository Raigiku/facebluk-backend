// import { DS, Uuid } from '@facebluk/domain'
// import { MongoDB } from '@facebluk/infra-mongodb'
// import { findUser } from '../user-resolver'

// describe('user-resolver', () => {
//   let mongoClient: MongoDB.MongoClient
//   let mongoDb: MongoDB.DbConn

//   beforeAll(() => {
//     const config = global as any
//     mongoClient = new MongoDB.MongoClient(config.MONGODB_TEST_DB_CONNECTION_STRING)
//     mongoDb = mongoClient.db(config.MONGODB_TEST_DB_NAME)
//   })

//   afterAll(async () => {
//     await mongoClient.close(true)
//   })

//   beforeEach(async () => {
//     await MongoDB.truncateCollections(mongoDb)
//   })

//   describe(`${findUser.name}: find a user by their id`, () => {
//     test('when the user exists then return them', async () => {
//       const newUser = DS.User.create({
//         data: { aggregateId: Uuid.create(), aggregateVersion: 1n, createdAt: new Date() },
//         payload: { tag: 'user-registered', alias: 'usera', name: 'user a' },
//       })
//       await mongoDb.collection<DS.User.Aggregate>(MongoDB.User.collectionName).insertOne(newUser)

//       const foundUser = await findUser(
//         { filter: { a: { id: newUser.aggregate.id } } },
//         newUser.aggregate.id,
//         mongoDb
//       )
//       expect(foundUser?.aggregate.id).toBe(newUser.aggregate.id)
//     })

//     test('when the user does not exist then return undefined', async () => {
//       const foundUser = await findUser(
//         { filter: { a: { id: Uuid.create() } } },
//         Uuid.create(),
//         mongoDb
//       )
//       expect(foundUser).toBeUndefined()
//     })
//   })

//   describe(`${findUser.name}: find a user by their alias`, () => {
//     test('when the user exists then return them', async () => {
//       const newUser = DS.User.create({
//         data: { aggregateId: Uuid.create(), aggregateVersion: 1n, createdAt: new Date() },
//         payload: { tag: 'user-registered', alias: 'usera', name: 'user a' },
//       })
//       await mongoDb.collection<DS.User.Aggregate>(MongoDB.User.collectionName).insertOne(newUser)

//       const foundUser = await findUser(
//         { filter: { b: { alias: newUser.alias } } },
//         newUser.aggregate.id,
//         mongoDb
//       )
//       expect(foundUser?.aggregate.id).toBe(newUser.aggregate.id)
//     })

//     test('when the user does not exist then return undefined', async () => {
//       const foundUser = await findUser(
//         { filter: { b: { alias: 'usera' } } },
//         Uuid.create(),
//         mongoDb
//       )
//       expect(foundUser).toBeUndefined()
//     })
//   })
// })
