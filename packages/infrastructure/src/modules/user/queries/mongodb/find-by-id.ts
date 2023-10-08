import { MongoDB as UserInfra } from '../..'
import { Db } from "mongodb";

export const findById = (mongoDb: Db) => (id: string) => {
  return mongoDb
    .collection<UserInfra.Document>(UserInfra.collectionName)
    .findOne({ 'aggregate.id': id })
}