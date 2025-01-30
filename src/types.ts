import { DataDescription, ModelType } from 'functional-models'

export type DatastoreAdapterInputs = {
  client: any
  getIndexForModel?: <T extends DataDescription>(model: ModelType<T>) => string
}

export type ErrorOperation = {
  status: any
  error: any
}

export type BulkResponse = {
  items: any[]
}
