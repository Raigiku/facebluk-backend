import { ES } from '@facebluk/domain'
import { PostgreSQL } from '@facebluk/infra-postgresql'
import { Supabase } from '@facebluk/infra-supabase'
import dotenv from 'dotenv'

const main = async () => {
  dotenv.config()
  const postgreSqlConfig = PostgreSQL.Config.create()
  const pgPool = new PostgreSQL.pg.Pool({
    host: postgreSqlConfig.host,
    database: postgreSqlConfig.database,
    user: postgreSqlConfig.username,
    password: postgreSqlConfig.password,
    port: postgreSqlConfig.port,
  })

  // await createFileStorageBuckets()
  await processEventsIntoConsistencyAggregates(pgPool)

  await pgPool.end()
}

const createFileStorageBuckets = async () => {
  const supabaseConfig = Supabase.Config.create()
  const supabaseClient = Supabase.createSupabaseClient(supabaseConfig)
  for (const bucketName of Supabase.FileStorage.fileBucketNames) {
    const getBuckerRes = await supabaseClient.storage.getBucket(bucketName)
    if (getBuckerRes.error !== null) {
      if (getBuckerRes.error.message === 'The resource was not found') {
        const createBucketRes = await supabaseClient.storage.createBucket(bucketName, {
          public: true,
        })
        if (createBucketRes.error !== null)
          console.error(`failed to create bucket ${bucketName} ${createBucketRes.error}`)
        else console.log(`bucket ${bucketName} created`)
      } else {
        console.error(`failed to get bucket ${bucketName} ${getBuckerRes.error}`)
      }
    }
  }
}

const processEventsIntoConsistencyAggregates = async (pool: PostgreSQL.pg.Pool) => {
  const pgClient = await pool.connect()

  const userEvents = await PostgreSQL.User.findManyEventsInOrder(pool)
  for (const event of userEvents) {
    if (event.payload.tag === 'user-registered')
      await PostgreSQL.User.registerInternalAggregate(pgClient, event as ES.User.RegisteredEvent)
  }

  const postEvents = await PostgreSQL.Post.findManyEventsInOrder(pool)
  for (const event of postEvents) {
    if (event.payload.tag === 'post-created')
      await PostgreSQL.Post.createInternalAggregate(pgClient, event)
  }

  const friendRequestEvents = await PostgreSQL.FriendRequest.findManyEventsInOrder(pool)
  for (const event of friendRequestEvents) {
    if (event.payload.tag === 'friend-request-accepted')
      await PostgreSQL.FriendRequest.acceptInternalAggregate(
        pgClient,
        event as ES.FriendRequest.AcceptedEvent
      )
    else if (event.payload.tag === 'friend-request-sent')
      await PostgreSQL.FriendRequest.sendInternalAggregate(
        pgClient,
        event as ES.FriendRequest.SentEvent
      )
    else if (event.payload.tag === 'friend-request-cancelled')
      await PostgreSQL.FriendRequest.cancelInternalAggregate(
        pgClient,
        event as ES.FriendRequest.CancelledEvent
      )
    else if (event.payload.tag === 'friend-request-rejected')
      await PostgreSQL.FriendRequest.rejectInternalAggregate(
        pgClient,
        event as ES.FriendRequest.RejectedEvent
      )
  }

  const userRelationshipEvents = await PostgreSQL.UserRelationship.findManyEventsInOrder(pool)
  let firstProcessed = false
  for (const event of userRelationshipEvents) {
    if (event.payload.tag === 'user-relationship-friended')
      await PostgreSQL.UserRelationship.friendInternalAggregate(
        pgClient,
        !firstProcessed,
        event as ES.UserRelationship.FriendedUserEvent
      )
    else if (event.payload.tag === 'user-relationship-unfriended')
      await PostgreSQL.UserRelationship.unfriendInternalAggregate(
        pgClient,
        event as ES.UserRelationship.UnfriendedUserEvent
      )
    firstProcessed = true
  }

  pgClient.release()
}

main()
  .then()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
