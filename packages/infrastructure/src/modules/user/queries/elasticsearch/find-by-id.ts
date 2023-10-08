import { ElasticSeach as UserInfra } from '../..'
import { Client } from "@elastic/elasticsearch";

export const findById = (elasticClient: Client) => (id: string) => {
  return elasticClient.get<UserInfra.Document>({
    index: UserInfra.indexName,
    id,
  })
}