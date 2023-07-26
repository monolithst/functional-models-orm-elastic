"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toElasticSearch = exports.propertiesToElasticQuery = exports.toElasticDateQuery = exports.toElasticQuery = exports.toElasticPaging = exports.toElasticSort = exports.toElasticSize = exports.getElasticQueryType = exports.toElasticValue = void 0;
const merge_1 = __importDefault(require("lodash/merge"));
const uniq_1 = __importDefault(require("lodash/uniq"));
const constants_1 = require("functional-models-orm/constants");
var ElasticEqualityType;
(function (ElasticEqualityType) {
    ElasticEqualityType["lt"] = "lt";
    ElasticEqualityType["lte"] = "lte";
    ElasticEqualityType["gt"] = "gt";
    ElasticEqualityType["gte"] = "gte";
})(ElasticEqualityType || (ElasticEqualityType = {}));
var ElasticQueryType;
(function (ElasticQueryType) {
    ElasticQueryType["match"] = "match";
    ElasticQueryType["wildcard"] = "wildcard";
    ElasticQueryType["range"] = "range";
})(ElasticQueryType || (ElasticQueryType = {}));
const EQUALITY_SYMBOL_MAP = {
    [constants_1.EQUALITY_SYMBOLS.LT]: ElasticEqualityType.lt,
    [constants_1.EQUALITY_SYMBOLS.LTE]: ElasticEqualityType.lte,
    [constants_1.EQUALITY_SYMBOLS.GT]: ElasticEqualityType.gt,
    [constants_1.EQUALITY_SYMBOLS.GTE]: ElasticEqualityType.gte,
    [constants_1.EQUALITY_SYMBOLS.EQUALS]: undefined
};
const toElasticValue = (s, queryType) => {
    if (queryType === ElasticQueryType.match) {
        return {
            query: s.value,
        };
    }
    if (queryType === ElasticQueryType.wildcard) {
        const value = s.value instanceof Date
            ? s.value.toISOString()
            : s.value;
        return {
            wildcard: `${Boolean(s.options.startsWith) ? '*' : ''}${value}${Boolean(s.options.endsWith) ? '*' : ''}`
        };
    }
    if (queryType === ElasticQueryType.range) {
        const equalitySymbol = EQUALITY_SYMBOL_MAP[s.options.equalitySymbol];
        if (!equalitySymbol) {
            throw new Error(`Unexpected equality symbol ${equalitySymbol}`);
        }
        return {
            [equalitySymbol]: s.value,
        };
    }
    throw new Error(`Unhandled queryType: ${queryType}`);
};
exports.toElasticValue = toElasticValue;
const getElasticQueryType = (s) => {
    if (s.valueType === constants_1.ORMType.string || s.valueType === constants_1.ORMType.date) {
        if (s.options.startsWith || s.options.endsWith) {
            return ElasticQueryType.wildcard;
        }
        return ElasticQueryType.match;
    }
    if (s.valueType === constants_1.ORMType.number) {
        if (s.options.equalitySymbol !== constants_1.EQUALITY_SYMBOLS.EQUALS) {
            return ElasticQueryType.range;
        }
    }
    return ElasticQueryType.match;
};
exports.getElasticQueryType = getElasticQueryType;
const toElasticSize = (take) => {
    return take
        ? {
            size: take
        }
        : {};
};
exports.toElasticSize = toElasticSize;
const toElasticSort = (sort) => {
    return sort
        ? {
            sort: `${sort.key}:${sort.order ? 'asc' : 'desc'}`
        } : {};
};
exports.toElasticSort = toElasticSort;
const toElasticPaging = (statement) => {
    return '';
};
exports.toElasticPaging = toElasticPaging;
const toElasticQuery = (s) => {
    const queryType = (0, exports.getElasticQueryType)(s);
    return {
        query: {
            [queryType]: {
                [s.name]: (0, exports.toElasticValue)(s, queryType)
            }
        }
    };
};
exports.toElasticQuery = toElasticQuery;
/*
type DatesAfterStatement = {
readonly type: 'datesAfter'
readonly key: string
readonly date: Date | string
readonly valueType: ORMType
readonly options: {
  readonly equalToAndAfter: boolean
}
}

type DatesBeforeStatement = {
readonly type: 'datesBefore'
readonly key: string
readonly date: Date | string
readonly valueType: ORMType
readonly options: {
  readonly equalToAndBefore: boolean
}
 */
const _getDateValue = (d) => {
    return d instanceof Date
        ? d.toISOString()
        : d;
};
const toElasticDateQuery = (datesBefore, datesAfter) => {
    const dateProps = (0, uniq_1.default)(Object.keys(datesBefore)
        .concat(Object.keys(datesAfter)));
    if (dateProps.length < 1) {
        return {};
    }
    return {
        query: {
            range: dateProps
                .reduce((acc, name) => {
                const before = datesBefore[name]
                    ? {
                        [datesBefore[name].options.equalToAndBefore
                            ? 'lte'
                            : 'lt']: _getDateValue(datesBefore[name].date)
                    }
                    : {};
                const after = datesAfter[name]
                    ? {
                        [datesAfter[name].options.equalToAndAfter
                            ? 'gte'
                            : 'gt']: _getDateValue(datesAfter[name].date)
                    }
                    : {};
                return (0, merge_1.default)(acc, { [name]: (0, merge_1.default)(before, after) });
            }, {})
        }
    };
};
exports.toElasticDateQuery = toElasticDateQuery;
const propertiesToElasticQuery = (properties) => {
    return Object.entries(properties || {}).reduce((acc, [_, partial]) => {
        return (0, merge_1.default)(acc, (0, exports.toElasticQuery)(partial));
    }, {});
};
exports.propertiesToElasticQuery = propertiesToElasticQuery;
const toElasticSearch = (index, ormQuery) => {
    const dateEntries = (0, exports.toElasticDateQuery)(ormQuery.datesBefore || {}, ormQuery.datesAfter || {});
    const properties = (0, exports.propertiesToElasticQuery)(ormQuery.properties);
    const sort = (0, exports.toElasticSort)(ormQuery.sort);
    const size = (0, exports.toElasticSize)(ormQuery.take);
    const paging = (0, exports.toElasticPaging)(ormQuery.page);
    return (0, merge_1.default)({ index }, properties, dateEntries, sort, paging, size);
};
exports.toElasticSearch = toElasticSearch;
//# sourceMappingURL=lib.js.map