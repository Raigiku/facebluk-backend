import { MongoDB as PostInfra } from '../..'
import { Db } from "mongodb";

export const findById = (mongoDb: Db) => (id: string) => {
  return mongoDb
    .collection<PostInfra.Document>(PostInfra.collectionName)
    .findOne({ 'aggregate.id': id })
}