"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.create = exports.defaultGetIndexForModel = void 0;
const lib_1 = require("./lib");
const defaultGetIndexForModel = (model) => {
    return model.getName().toLowerCase();
};
exports.defaultGetIndexForModel = defaultGetIndexForModel;
const create = ({ client, getIndexForModel = exports.defaultGetIndexForModel, }) => {
    const retrieve = (model, id) => __awaiter(void 0, void 0, void 0, function* () {
        const index = getIndexForModel(model);
        const { body } = yield client.get({
            index,
            id,
        });
        return body._source;
    });
    const search = (model, ormQuery) => {
        return Promise.resolve().then(() => __awaiter(void 0, void 0, void 0, function* () {
            const index = getIndexForModel(model);
            const search = (0, lib_1.toElasticSearch)(index, ormQuery);
            const results = yield client.search(search);
            return results;
        }));
    };
    const save = (instance) => __awaiter(void 0, void 0, void 0, function* () {
        const index = getIndexForModel(instance.getModel());
        const data = yield instance.toObj();
        yield client.index({
            id: yield instance.getPrimaryKey(),
            index,
            body: data
        });
        return data;
    });
    const bulkInsert = (model, instances) => __awaiter(void 0, void 0, void 0, function* () {
        if (instances.length < 1) {
            return;
        }
        const index = getIndexForModel(instances[0].getModel());
        const operations = yield instances.reduce((accP, instance) => __awaiter(void 0, void 0, void 0, function* () {
            const acc = yield accP;
            const data = yield instance.toObj();
            const id = yield instance.getPrimaryKey();
            return acc.concat([{
                    index: { _index: index, _id: id },
                },
                data,
            ]);
            return acc.concat(data);
        }), Promise.resolve([]));
        const bulkResponse = yield client.bulk({ index, refresh: true, body: operations });
        //TODO: Handle exceptions
        return;
    });
    const deleteObj = (instance) => __awaiter(void 0, void 0, void 0, function* () {
        const index = getIndexForModel(instance.getModel());
        const result = yield client.delete({
            index,
            id: yield instance.getPrimaryKey(),
        });
        return;
    });
    return {
        bulkInsert,
        //@ts-ignore
        search,
        retrieve,
        save,
        delete: deleteObj,
    };
};
exports.create = create;
//# sourceMappingURL=datastoreProvider.js.map