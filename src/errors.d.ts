import * as types from './types';
export declare class ESBulkInsertError extends Error {
    ErrorOperations: types.ErrorOperation[];
    constructor(bulkResponse: types.BulkResponse);
}
