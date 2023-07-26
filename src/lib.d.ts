import { interfaces as ormInterfaces } from 'functional-models-orm';
declare enum ElasticQueryType {
    match = "match",
    wildcard = "wildcard",
    range = "range"
}
type PropertiesObject = {
    [s: string]: ormInterfaces.PropertyStatement;
};
export declare const toElasticValue: (s: ormInterfaces.PropertyStatement, queryType: ElasticQueryType) => {
    query: any;
    wildcard?: undefined;
} | {
    wildcard: string;
    query?: undefined;
} | {
    [x: string]: any;
    query?: undefined;
    wildcard?: undefined;
};
export declare const getElasticQueryType: (s: ormInterfaces.PropertyStatement) => ElasticQueryType;
export declare const toElasticSize: (take: number | undefined) => {
    size: number;
} | {
    size?: undefined;
};
export declare const toElasticSort: (sort: ormInterfaces.SortStatement | undefined) => {
    sort: string;
} | {
    sort?: undefined;
};
export declare const toElasticPaging: (statement: ormInterfaces.PaginationStatement | undefined) => string;
export declare const toElasticQuery: (s: ormInterfaces.PropertyStatement) => {
    query: {
        [x: string]: {
            [x: string]: {
                query: any;
                wildcard?: undefined;
            } | {
                wildcard: string;
                query?: undefined;
            } | {
                [x: string]: any;
                query?: undefined;
                wildcard?: undefined;
            };
        };
    };
};
export declare const toElasticDateQuery: (datesBefore: {
    [s: string]: ormInterfaces.DatesBeforeStatement;
}, datesAfter: {
    [s: string]: ormInterfaces.DatesAfterStatement;
}) => {
    query?: undefined;
} | {
    query: {
        range: {};
    };
};
export declare const propertiesToElasticQuery: (properties: PropertiesObject | undefined) => {};
export declare const toElasticSearch: (index: string, ormQuery: ormInterfaces.OrmQuery) => any;
export {};
