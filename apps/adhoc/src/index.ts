import { FileStorage } from '@facebluk/infra-file-storage'
import dotenv from 'dotenv'

const main = async () => {
  dotenv.config()

  const fileStorageConfig = FileStorage.Config.create()
  const supabaseClient = FileStorage.createSupabaseClient(fileStorageConfig)

  for (const bucketName of FileStorage.fileBucketNames) {
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
