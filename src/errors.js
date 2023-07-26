"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESBulkInsertError = void 0;
class ESBulkInsertError extends Error {
    constructor(bulkResponse) {
        super();
        this.ErrorOperations = [];
        this.ErrorOperations = bulkResponse.items.reduce((acc, action, i) => {
            const operation = Object.keys(action)[0];
            if (action[operation].error) {
                const errorOperation = {
                    status: action[operation].status,
                    error: action[operation].error,
                };
                return acc.concat(errorOperation);
            }
            return acc;
        }, []);
    }
}
exports.ESBulkInsertError = ESBulkInsertError;
//# sourceMappingURL=errors.js.map