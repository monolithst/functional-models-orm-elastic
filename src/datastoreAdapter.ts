import get from 'lodash/get'
import merge from 'lodash/merge'
import {
  DatastoreAdapter,
  OrmSearch,
  DataDescription,
  PrimaryKeyType,
  ModelType,
  ModelInstance,
  OrmModel,
} from 'functional-models'
import * as types from './types'
import { toElasticSearch } from './lib'

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }
const DEFAULT_TAKE = 10000

export const defaultGetIndexForModel = <T extends DataDescription>(
  model: ModelType<T>
) => {
  const x = model.getName().toLowerCase()
  return x
}

const create = ({
  client,
  getIndexForModel = defaultGetIndexForModel,
}: types.DatastoreAdapterInputs): WithRequired<
  DatastoreAdapter,
  'bulkInsert'
> => {
  const retrieve = async <T extends DataDescription>(
    model: ModelType<T>,
    id: PrimaryKeyType
  ) => {
    const index = getIndexForModel(model)
    const { body } = await client.get({
      index,
      id,
    })

    return body._source
  }

  const search = <T extends DataDescription>(
    model: ModelType<T>,
    ormQuery: OrmSearch
  ) => {
    return Promise.resolve().then(async () => {
      const index = getIndexForModel(model)
      const updatedSearch = !ormQuery.take
        ? merge(ormQuery, { take: DEFAULT_TAKE })
        : ormQuery
      const search = toElasticSearch(index, updatedSearch)
      const response = await client.search(search)
      const toMap = get(response, 'body.hits.hits', [])

      // We have to build the paging ourselves.
      const took = toMap.length
      const total = response.body.hits.total.value
      const isMore = total - took > 0
      const page = isMore ? { from: took } : undefined

      const instances = toMap.map((raw: any) => raw._source)
      return {
        instances,
        page,
      }
    })
  }

  const save = async <T extends DataDescription>(
    instance: ModelInstance<T>
  ) => {
    const index = getIndexForModel(instance.getModel())
    const data = await instance.toObj<T>()
    const id = instance.getPrimaryKey()
    await client.index({
      id,
      index,
      body: data,
    })
    return data
  }

  const bulkInsert = async <T extends DataDescription>(
    model: OrmModel<T>,
    instances: readonly ModelInstance<T>[]
  ) => {
    if (instances.length < 1) {
      return
    }
    const index = getIndexForModel(instances[0].getModel())
    const operations = await instances.reduce(
      async (accP: Promise<any[]>, instance: ModelInstance<T>) => {
        const acc = await accP
        const data = await instance.toObj()
        const id = instance.getPrimaryKey()
        return acc.concat([
          {
            index: { _index: index, _id: id },
          },
          data,
        ])
        return acc.concat(data)
      },
      Promise.resolve([] as any[])
    )
    await client.bulk({
      index,
      refresh: true,
      body: operations,
    })
    //TODO: Handle exceptions
    return
  }

  const deleteObj = async <T extends DataDescription>(
    model: OrmModel<T>,
    primarykey: PrimaryKeyType
  ) => {
    const index = getIndexForModel(model)
    await client.delete({
      index,
      id: primarykey,
    })
    return
  }

  return {
    bulkInsert,
    //@ts-ignore
    search,
    retrieve,
    save,
    delete: deleteObj,
  }
}

export { create }
