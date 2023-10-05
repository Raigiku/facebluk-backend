// import { DS, Uuid } from '@facebluk/domain'
// import { MongoDB } from '@facebluk/infra-mongodb'
// import { queryByFilterA } from '../friend-requests-resolver'

// describe('friend-requests-resolver', () => {
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

//   describe(`${queryByFilterA.name}: find non cancelled friend requests of request user`, () => {
//     test('when friend requests exist then return them', async () => {
//       const userA = DS.User.create({
//         data: { aggregateId: Uuid.create(), aggregateVersion: 1n, createdAt: new Date() },
//         payload: { alias: 'userA', name: 'user a', tag: 'user-registered' },
//       })
//       const userB = DS.User.create({
//         data: { aggregateId: Uuid.create(), aggregateVersion: 1n, createdAt: new Date() },
//         payload: { alias: 'userB', name: 'user b', tag: 'user-registered' },
//       })
//       const userC = DS.User.create({
//         data: { aggregateId: Uuid.create(), aggregateVersion: 1n, createdAt: new Date() },
//         payload: { alias: 'userC', name: 'user c', tag: 'user-registered' },
//       })
//       const userAToBFriendRequest = DS.FriendRequest.create(
//         {
//           data: { aggregateId: Uuid.create(), aggregateVersion: 1n, createdAt: new Date() },
//           payload: {
//             fromUserId: userA.aggregate.id,
//             toUserId: userB.aggregate.id,
//             tag: 'friend-request-sent',
//           },
//         },
//         userA,
//         userB
//       )
//       const userAToBCancelledEvent = DS.FriendRequest.applyCancelledEvent(userAToBFriendRequest, {
//         data: {
//           aggregateId: userAToBFriendRequest.aggregate.id,
//           aggregateVersion: 2n,
//           createdAt: new Date(),
//         },
//         payload: { tag: 'friend-request-cancelled' },
//       })
//       const newFriendRequests = [
//         userAToBCancelledEvent,
//         DS.FriendRequest.create(
//           {
//             data: { aggregateId: Uuid.create(), aggregateVersion: 1n, createdAt: new Date() },
//             payload: {
//               fromUserId: userA.aggregate.id,
//               toUserId: userC.aggregate.id,
//               tag: 'friend-request-sent',
//             },
//           },
//           userA,
//           userC
//         ),
//         DS.FriendRequest.create(
//           {
//             data: { aggregateId: Uuid.create(), aggregateVersion: 1n, createdAt: new Date() },
//             payload: {
//               fromUserId: userB.aggregate.id,
//               toUserId: userC.aggregate.id,
//               tag: 'friend-request-sent',
//             },
//           },
//           userB,
//           userC
//         ),
//       ]
//       await mongoDb
//         .collection<DS.FriendRequest.Aggregate>(MongoDB.FriendRequest.collectionName)
//         .insertMany(newFriendRequests)

//       const friendRequests = await queryByFilterA(
//         userA.aggregate.id,
//         {
//           page: 1,
//           pageSize: 20,
//         },
//         mongoDb
//       )
//       expect(friendRequests.data.length).toBe(1)
//     })

//     test('when friend requests do not exist then return empty pagination', async () => {
//       const userA = DS.User.create({
//         data: { aggregateId: Uuid.create(), aggregateVersion: 1n, createdAt: new Date() },
//         payload: { alias: 'userA', name: 'user a', tag: 'user-registered' },
//       })

//       const friendRequests = await queryByFilterA(
//         userA.aggregate.id,
//         {
//           page: 1,
//           pageSize: 20,
//         },
//         mongoDb
//       )
//       expect(friendRequests.data.length).toBe(0)
//     })
//   })
// })
