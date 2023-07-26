import * as types from './types'

export class ESBulkInsertError extends Error {
  ErrorOperations : types.ErrorOperation[] = []

  constructor(bulkResponse: types.BulkResponse) {
    super()
    this.ErrorOperations = bulkResponse.items.reduce((acc, action, i) => {
      const operation = Object.keys(action)[0]
      if (action[operation].error) {
        const errorOperation : types.ErrorOperation = {
          status: action[operation].status,
          error: action[operation].error,
        }
        return acc.concat(errorOperation)
      }
      return acc
    }, [] as types.ErrorOperation[])
  }
}
