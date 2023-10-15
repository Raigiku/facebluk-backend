import { Infra } from '@facebluk/infrastructure'
import { DateTime } from "luxon";

export const removeCachedPostsJob = async (redisClient: Infra.Redis.RedisClientType) => {
  const twelveHoursAgoInSeconds = DateTime.utc().minus({ hours: 12 }).toSeconds()
  await redisClient.zRemRangeByScore(Infra.Post.Redis.keyName, 0, twelveHoursAgoInSeconds - 1)
}