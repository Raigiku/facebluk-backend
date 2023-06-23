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
  // await processEventsIntoConsistencyAggregates(pgPool)

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
  for (const rawEvent of userEvents) {
    if (rawEvent.payload.tag === 'user-registered')
      await PostgreSQL.User.registerInternalAggregate(pgClient, {
        data: {
          aggregateId: rawEvent.aggregate_id,
          aggregateVersion: rawEvent.aggregate_version,
          createdAt: rawEvent.created_at,
          published: rawEvent.published,
        },
        payload: rawEvent.payload,
      })
  }

  const postEvents = await PostgreSQL.Post.findManyEventsInOrder(pool)
  for (const rawEvent of postEvents) {
    if (rawEvent.payload.tag === 'post-created')
      await PostgreSQL.Post.createInternalAggregate(pgClient, {
        data: {
          aggregateId: rawEvent.aggregate_id,
          aggregateVersion: rawEvent.aggregate_version,
          createdAt: rawEvent.created_at,
          published: rawEvent.published,
        },
        payload: rawEvent.payload,
      })
  }

  const friendRequestEvents = await PostgreSQL.FriendRequest.findManyEventsInOrder(pool)
  for (const rawEvent of friendRequestEvents) {
    if (rawEvent.payload.tag === 'friend-request-accepted')
      await PostgreSQL.FriendRequest.acceptInternalAggregate(pgClient, {
        data: {
          aggregateId: rawEvent.aggregate_id,
          aggregateVersion: rawEvent.aggregate_version,
          createdAt: rawEvent.created_at,
          published: rawEvent.published,
        },
        payload: rawEvent.payload,
      })
    else if (rawEvent.payload.tag === 'friend-request-sent')
      await PostgreSQL.FriendRequest.sendInternalAggregate(pgClient, {
        data: {
          aggregateId: rawEvent.aggregate_id,
          aggregateVersion: rawEvent.aggregate_version,
          createdAt: rawEvent.created_at,
          published: rawEvent.published,
        },
        payload: rawEvent.payload,
      })
    else if (rawEvent.payload.tag === 'friend-request-cancelled')
      await PostgreSQL.FriendRequest.cancelInternalAggregate(pgClient, {
        data: {
          aggregateId: rawEvent.aggregate_id,
          aggregateVersion: rawEvent.aggregate_version,
          createdAt: rawEvent.created_at,
          published: rawEvent.published,
        },
        payload: rawEvent.payload,
      })
    else if (rawEvent.payload.tag === 'friend-request-rejected')
      await PostgreSQL.FriendRequest.rejectInternalAggregate(pgClient, {
        data: {
          aggregateId: rawEvent.aggregate_id,
          aggregateVersion: rawEvent.aggregate_version,
          createdAt: rawEvent.created_at,
          published: rawEvent.published,
        },
        payload: rawEvent.payload,
      })
  }

  const userRelationshipEvents = await PostgreSQL.UserRelationship.findManyEventsInOrder(pool)
  let firstProcessed = false
  for (const rawEvent of userRelationshipEvents) {
    if (rawEvent.payload.tag === 'user-relationship-friended')
      await PostgreSQL.UserRelationship.friendInternalAggregate(pgClient, !firstProcessed, {
        data: {
          aggregateId: rawEvent.aggregate_id,
          aggregateVersion: rawEvent.aggregate_version,
          createdAt: rawEvent.created_at,
          published: rawEvent.published,
        },
        payload: rawEvent.payload,
      })
    else if (rawEvent.payload.tag === 'user-relationship-unfriended')
      await PostgreSQL.UserRelationship.unfriendInternalAggregate(pgClient, {
        data: {
          aggregateId: rawEvent.aggregate_id,
          aggregateVersion: rawEvent.aggregate_version,
          createdAt: rawEvent.created_at,
          published: rawEvent.published,
        },
        payload: rawEvent.payload,
      })
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
