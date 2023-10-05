// import { DS, Uuid } from '@facebluk/domain'
// import { MongoDB } from '@facebluk/infra-mongodb'
// import { addRelationshipWithSearchedUsers, findBlockedRelationships } from '../users-resolver'

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

//   describe(`${findBlockedRelationships.name}: find blocked relationships with request user`, () => {
//     test('when the user has blocked relationships then return them', async () => {
//       const userAId = Uuid.create()
//       const userBId = Uuid.create()
//       const blockedRelationship = DS.UserRelationship.createFromBlockedEvent({
//         data: { aggregateId: Uuid.create(), aggregateVersion: 1n, createdAt: new Date() },
//         payload: {
//           tag: 'user-relationship-blocked',
//           fromUserId: userAId,
//           toUserId: userBId,
//         },
//       })
//       await mongoDb
//         .collection<DS.UserRelationship.Aggregate>(MongoDB.UserRelationship.collectionName)
//         .insertOne(blockedRelationship)

//       const foundRelationships = await findBlockedRelationships(userAId, mongoDb)
//       expect(foundRelationships.length).toBeGreaterThan(0)
//     })

//     test('when the user has no blocked relationships then return empty', async () => {
//       const userAId = Uuid.create()
//       const userBId = Uuid.create()
//       const blockedRelationship = DS.UserRelationship.createFromFriendedEvent({
//         data: { aggregateId: Uuid.create(), aggregateVersion: 1n, createdAt: new Date() },
//         payload: {
//           tag: 'user-relationship-friended',
//           fromUserId: userAId,
//           toUserId: userBId,
//         },
//       })
//       await mongoDb
//         .collection<DS.UserRelationship.Aggregate>(MongoDB.UserRelationship.collectionName)
//         .insertOne(blockedRelationship)

//       const foundRelationships = await findBlockedRelationships(userAId, mongoDb)
//       expect(foundRelationships.length).toBe(0)
//     })
//   })

//   describe(`${addRelationshipWithSearchedUsers.name}: find users and add the relationship with the request user`, () => {
//     test('when the users exist then return them', async () => {
//       const newUser = DS.User.create({
//         data: { aggregateId: Uuid.create(), aggregateVersion: 1n, createdAt: new Date() },
//         payload: { tag: 'user-registered', alias: 'usera', name: 'user a' },
//       })
//       await mongoDb.collection<DS.User.Aggregate>(MongoDB.User.collectionName).insertOne(newUser)

//       const foundUsers = await addRelationshipWithSearchedUsers(
//         [newUser.aggregate.id],
//         newUser.aggregate.id,
//         mongoDb
//       )
//       expect(foundUsers.length).toBeGreaterThan(0)
//     })

//     test('when the users do not exist then return empty', async () => {
//       const foundUsers = await addRelationshipWithSearchedUsers(
//         [Uuid.create()],
//         Uuid.create(),
//         mongoDb
//       )
//       expect(foundUsers.length).toBe(0)
//     })
//   })
// })
