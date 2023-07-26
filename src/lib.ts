import merge from 'lodash/merge'
import uniq from 'lodash/uniq'
import { interfaces as ormInterfaces } from 'functional-models-orm'
import { ORMType, EQUALITY_SYMBOLS } from 'functional-models-orm/constants'

enum ElasticEqualityType {
  lt = 'lt',
  lte = 'lte',
  gt = 'gt',
  gte = 'gte',
}

enum ElasticQueryType {
  match = 'match',
  wildcard = 'wildcard',
  range = 'range',
}

type PropertiesObject = {
  [s: string]: ormInterfaces.PropertyStatement
}

const EQUALITY_SYMBOL_MAP : {[key in EQUALITY_SYMBOLS]: string|undefined } = {
  [EQUALITY_SYMBOLS.LT]: ElasticEqualityType.lt,
  [EQUALITY_SYMBOLS.LTE]: ElasticEqualityType.lte,
  [EQUALITY_SYMBOLS.GT]: ElasticEqualityType.gt,
  [EQUALITY_SYMBOLS.GTE]: ElasticEqualityType.gte,
  [EQUALITY_SYMBOLS.EQUALS]: undefined
}


export const toElasticValue = (s: ormInterfaces.PropertyStatement, queryType: ElasticQueryType) => {
  if (queryType === ElasticQueryType.match) {
    return {
      query: s.value,
    }
  }
  if (queryType === ElasticQueryType.wildcard) {
    const value = s.value instanceof Date
      ? s.value.toISOString()
      : s.value
    return {
      wildcard: `${Boolean(s.options.startsWith) ? '*' : ''}${value}${Boolean(s.options.endsWith) ? '*' : ''}`
    }
  }
  if (queryType === ElasticQueryType.range) {
    const equalitySymbol = EQUALITY_SYMBOL_MAP[s.options.equalitySymbol as EQUALITY_SYMBOLS]
    if (!equalitySymbol) {
      throw new Error(`Unexpected equality symbol ${equalitySymbol}`)
    }
    return {
      [equalitySymbol]: s.value,
    }
  }
  throw new Error(`Unhandled queryType: ${queryType}`)
}

export const getElasticQueryType = (s: ormInterfaces.PropertyStatement) : ElasticQueryType => {
  if (s.valueType === ORMType.string || s.valueType === ORMType.date) {
    if (s.options.startsWith || s.options.endsWith) {
      return ElasticQueryType.wildcard
    }
    return ElasticQueryType.match
  }
  if (s.valueType === ORMType.number) {
    if (s.options.equalitySymbol !== EQUALITY_SYMBOLS.EQUALS) {
      return ElasticQueryType.range
    }
  }
  return ElasticQueryType.match
}

export const toElasticSize = (take: number|undefined) => {
  return take 
    ? {
      size: take
    }
    : {}
}

export const toElasticSort = (sort: ormInterfaces.SortStatement|undefined) => {
  return sort
    ? {
      sort: `${sort.key}:${sort.order ? 'asc' : 'desc' }`
    } : {}
}

export const toElasticPaging = (statement: ormInterfaces.PaginationStatement|undefined) => {
  return ''
}

export const toElasticQuery = (s: ormInterfaces.PropertyStatement) => {
  const queryType = getElasticQueryType(s)
  return {
    query: {
      [queryType]: {
        [s.name]: toElasticValue(s, queryType)
      }
    }
  }
}
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

const _getDateValue = (d: Date|string) => {
  return d instanceof Date
    ? d.toISOString()
    : d
}

export const toElasticDateQuery = (
  datesBefore: { [s: string]: ormInterfaces.DatesBeforeStatement },
  datesAfter: { [s: string]: ormInterfaces.DatesAfterStatement }
) => {
  const dateProps = uniq(Object.keys(datesBefore)
    .concat(Object.keys(datesAfter))
  )
  if (dateProps.length < 1) {
    return {}
  }
  return {
    query: {
      range: dateProps
        .reduce((acc, name) => {
          const before = datesBefore[name]
            ? {
              [datesBefore[name].options.equalToAndBefore
                ? 'lte'
                : 'lt'
              ]: _getDateValue(datesBefore[name].date)
            }
            : {}
          const after = datesAfter[name]
            ? {
              [datesAfter[name].options.equalToAndAfter
                ? 'gte'
                : 'gt'
              ]: _getDateValue(datesAfter[name].date)
            }
            : {}
          return merge(acc, {[name]: merge(before, after)})
        }, {})
    }
  }
}

export const propertiesToElasticQuery = (properties: PropertiesObject|undefined) => {
  return Object.entries(properties || {}).reduce(
    (acc, [_, partial]) => {
      return merge(acc, toElasticQuery(partial))
    },
    {}
  )
}

export const toElasticSearch = (index: string, ormQuery: ormInterfaces.OrmQuery) => {
  const dateEntries = toElasticDateQuery(
    ormQuery.datesBefore || {},
    ormQuery.datesAfter || {}
  )
  const properties = propertiesToElasticQuery(ormQuery.properties)
  const sort = toElasticSort(ormQuery.sort)
  const size = toElasticSize(ormQuery.take)
  const paging = toElasticPaging(ormQuery.page)

  return merge(
    { index },
    properties, 
    dateEntries,
    sort,
    paging,
    size,
  )
}
