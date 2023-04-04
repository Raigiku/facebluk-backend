// import { CMD, ES, UA, Uuid } from '../../..'

// describe('send-friend-request-handler', () => {
//   test('throw if from user id is not guid', async () => {
//     const request: CMD.SendFriendRequest.Request = {
//       id: '5d1c4217-f387-4d9a-9735-ceb2281f4176',
//       fromUserId: 'userA',
//       toUserId: '16615606-6530-4416-9e5f-0aae8a3cfeb3',
//     }
//     await expect(
//       CMD.SendFriendRequest.handle(request, {
//         getLastFriendRequestBetweenUsers: () => Promise.resolve(undefined),
//         getUserById: () => Promise.resolve(undefined),
//         getUserRelationship: () => Promise.resolve(undefined),
//         processEvent: () => Promise.resolve(),
//       })
//     ).rejects.toThrow(Uuid.errors.notValidFormat(request.id, 'fromUserId'))
//   })

//   test('throw if from user id is not guid', async () => {
//     const request: CMD.SendFriendRequest.Request = {
//       id: '5d1c4217-f387-4d9a-9735-ceb2281f4176',
//       fromUserId: '16615606-6530-4416-9e5f-0aae8a3cfeb3',
//       toUserId: 'userB',
//     }
//     await expect(
//       CMD.SendFriendRequest.handle(request, {
//         getLastFriendRequestBetweenUsers: () => Promise.resolve(undefined),
//         getUserById: () => Promise.resolve(undefined),
//         getUserRelationship: () => Promise.resolve(undefined),
//         processEvent: () => Promise.resolve(),
//       })
//     ).rejects.toThrow(Uuid.errors.notValidFormat(request.id, 'toUserId'))
//   })

//   test('throw if from user id is same as to user id', async () => {
//     const request: CMD.SendFriendRequest.Request = {
//       id: '5d1c4217-f387-4d9a-9735-ceb2281f4176',
//       fromUserId: '16615606-6530-4416-9e5f-0aae8a3cfeb3',
//       toUserId: '16615606-6530-4416-9e5f-0aae8a3cfeb3',
//     }

//     const getUserById: UA.User.FnGetById = () => Promise.resolve({ id: request.toUserId })

//     await expect(
//       CMD.SendFriendRequest.handle(request, {
//         getLastFriendRequestBetweenUsers: () => Promise.resolve(undefined),
//         getUserById,
//         getUserRelationship: () => Promise.resolve(undefined),
//         processEvent: () => Promise.resolve(),
//       })
//     ).rejects.toThrow(ES.FriendRequest.errors.fromUserCannotBeToUser(request.id))
//   })

//   test('throw if from user does not exist', async () => {
//     const request: CMD.SendFriendRequest.Request = {
//       id: '5d1c4217-f387-4d9a-9735-ceb2281f4176',
//       fromUserId: '16615606-6530-4416-9e5f-0aae8a3cfeb3',
//       toUserId: '1298da85-b08d-421f-a638-bc615afde720',
//     }

//     const getUserById: UA.User.FnGetById = (id: string) =>
//       id === request.fromUserId ? Promise.resolve(undefined) : Promise.resolve({ id: request.toUserId })

//     await expect(
//       CMD.SendFriendRequest.handle(request, {
//         getLastFriendRequestBetweenUsers: () => Promise.resolve(undefined),
//         getUserById,
//         getUserRelationship: () => Promise.resolve(undefined),
//         processEvent: () => Promise.resolve(),
//       })
//     ).rejects.toThrow(CMD.SendFriendRequest.errors.fromUserDoesNotExist(request.id))
//   })

//   test('throw if to user does not exist', async () => {
//     const request: CMD.SendFriendRequest.Request = {
//       id: '5d1c4217-f387-4d9a-9735-ceb2281f4176',
//       fromUserId: '16615606-6530-4416-9e5f-0aae8a3cfeb3',
//       toUserId: '1298da85-b08d-421f-a638-bc615afde720',
//     }

//     const getUserById: UA.User.FnGetById = (id: string) =>
//       id === request.toUserId ? Promise.resolve(undefined) : Promise.resolve({ id: request.fromUserId })

//     await expect(
//       CMD.SendFriendRequest.handle(request, {
//         getLastFriendRequestBetweenUsers: () => Promise.resolve(undefined),
//         getUserById,
//         getUserRelationship: () => Promise.resolve(undefined),
//         processEvent: () => Promise.resolve(),
//       })
//     ).rejects.toThrow(CMD.SendFriendRequest.errors.toUserDoesNotExist(request.id))
//   })

//   test('throw if there is an already pending friend request', async () => {
//     const request: CMD.SendFriendRequest.Request = {
//       id: '5d1c4217-f387-4d9a-9735-ceb2281f4176',
//       fromUserId: '16615606-6530-4416-9e5f-0aae8a3cfeb3',
//       toUserId: '1298da85-b08d-421f-a638-bc615afde720',
//     }

//     const getUserById: UA.User.FnGetById = (id: string) =>
//       id === request.toUserId ? Promise.resolve({ id: request.toUserId }) : Promise.resolve({ id: request.fromUserId })

//     const getLastFriendRequestBetweenUsers: ES.FriendRequest.FnGetLastBetweenUsers = () =>
//       Promise.resolve({
//         tag: 'pending-aggregate',
//         fromUserId: request.fromUserId,
//         toUserId: request.toUserId,
//         data: { createdAt: new Date(), version: 1n, id: '' },
//       })

//     await expect(
//       CMD.SendFriendRequest.handle(request, {
//         getLastFriendRequestBetweenUsers,
//         getUserById,
//         getUserRelationship: () => Promise.resolve(undefined),
//         processEvent: () => Promise.resolve(),
//       })
//     ).rejects.toThrow(CMD.SendFriendRequest.errors.alreadyPendingFriendRequest(request.id))
//   })

//   test('throw if the users are already friends', async () => {
//     const request: CMD.SendFriendRequest.Request = {
//       id: '5d1c4217-f387-4d9a-9735-ceb2281f4176',
//       fromUserId: '16615606-6530-4416-9e5f-0aae8a3cfeb3',
//       toUserId: '1298da85-b08d-421f-a638-bc615afde720',
//     }

//     const getUserById: UA.User.FnGetById = (id: string) =>
//       id === request.toUserId ? Promise.resolve({ id: request.toUserId }) : Promise.resolve({ id: request.fromUserId })

//     const getLastFriendRequestBetweenUsers: ES.FriendRequest.FnGetLastBetweenUsers = () =>
//       Promise.resolve({
//         tag: 'accepted-aggregate',
//         acceptedAt: new Date(),
//         fromUserId: request.fromUserId,
//         toUserId: request.toUserId,
//         data: { createdAt: new Date(), version: 1n, id: '' },
//       })

//     await expect(
//       CMD.SendFriendRequest.handle(request, {
//         getLastFriendRequestBetweenUsers,
//         getUserById,
//         getUserRelationship: () => Promise.resolve(undefined),
//         processEvent: () => Promise.resolve(),
//       })
//     ).rejects.toThrow(CMD.SendFriendRequest.errors.alreadyPendingFriendRequest(request.id))
//   })
// })
