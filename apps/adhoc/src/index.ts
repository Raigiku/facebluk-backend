import { Supabase } from '@facebluk/infra-supabase'
import dotenv from 'dotenv'

const main = async () => {
  dotenv.config()
  await createFileStorageBuckets()
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

main()
  .then()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
