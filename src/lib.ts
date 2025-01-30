import merge from 'lodash/merge'
import {
  BooleanQuery,
  DatastoreValueType,
  DatesAfterQuery,
  DatesBeforeQuery,
  EqualitySymbol,
  isALinkToken,
  isPropertyBasedQuery,
  OrmSearch,
  PropertyQuery,
  Query,
  QueryTokens,
  SortOrder,
  SortStatement,
  threeitize,
  validateOrmSearch,
} from 'functional-models'

const MAX_TAKE = 10000

enum ElasticEqualityType {
  lt = 'lt',
  lte = 'lte',
  gt = 'gt',
  gte = 'gte',
}

enum ElasticQueryType {
  match = 'match',
  term = 'term',
  wildcard = 'wildcard',
  range = 'range',
}

const EQUALITY_SYMBOL_MAP: Record<EqualitySymbol, string | undefined> = {
  [EqualitySymbol.lt]: ElasticEqualityType.lt,
  [EqualitySymbol.lte]: ElasticEqualityType.lte,
  [EqualitySymbol.gt]: ElasticEqualityType.gt,
  [EqualitySymbol.gte]: ElasticEqualityType.gte,
  [EqualitySymbol.eq]: undefined,
}

export const toElasticValue = (
  s: PropertyQuery,
  queryType: ElasticQueryType
) => {
  if (queryType === ElasticQueryType.term) {
    return {
      value: s.value,
    }
  }
  if (queryType === ElasticQueryType.wildcard) {
    const value = s.value instanceof Date ? s.value.toISOString() : s.value
    return {
      value: `${s.options.endsWith ? '*' : ''}${value}${s.options.startsWith ? '*' : ''}`,
    }
  }
  if (queryType === ElasticQueryType.range) {
    const equalitySymbol =
      EQUALITY_SYMBOL_MAP[s.equalitySymbol as EqualitySymbol]
    if (!equalitySymbol) {
      throw new Error(`Unexpected equality symbol ${equalitySymbol}`)
    }
    return {
      [equalitySymbol]: s.value,
    }
  }
  throw new Error(`Unhandled queryType: ${queryType}`)
}

export const getElasticQueryType = (s: PropertyQuery): ElasticQueryType => {
  if (
    s.valueType === DatastoreValueType.string ||
    s.valueType === DatastoreValueType.date
  ) {
    if (s.options.startsWith || s.options.endsWith) {
      return ElasticQueryType.wildcard
    }
    return ElasticQueryType.term
  }
  if (s.valueType === DatastoreValueType.number) {
    if (s.equalitySymbol !== EqualitySymbol.eq) {
      return ElasticQueryType.range
    }
  }
  return ElasticQueryType.term
}

export const toElasticSize = (search: OrmSearch) => {
  if (search.take) {
    if (search.page) {
      const isAboveMax = search.take + search.page.from > MAX_TAKE
      if (isAboveMax) {
        return { size: MAX_TAKE - search.page.from }
      }
    }
    return { size: search.take }
  }
  return {}
}

export const toElasticSort = (sort: SortStatement | undefined) => {
  return sort
    ? {
        sort: `${sort.key}:${sort.order === SortOrder.asc ? 'asc' : 'desc'}`,
      }
    : {}
}

export const toElasticPaging = (page?: { from: number }) => {
  return page
}

export const toElasticQuery = (s: PropertyQuery) => {
  const queryType = getElasticQueryType(s)
  return {
    [queryType]: {
      [`${s.key}`]: toElasticValue(s, queryType),
    },
  }
}

const _getDateValue = (d: Date | string) => {
  return d instanceof Date ? d.toISOString() : d
}

export const toElasticDateRange = (
  statement: DatesBeforeQuery | DatesAfterQuery
) => {
  const name =
    statement.type === 'datesBefore'
      ? statement.options.equalToAndBefore
        ? 'lte'
        : 'lt'
      : statement.options.equalToAndAfter
        ? 'gte'
        : 'gt'
  return {
    range: {
      [statement.key]: {
        [name]: _getDateValue(statement.date),
      },
    },
  }
}

const _getBooleanFunc = (token: BooleanQuery) => {
  return token === 'AND' ? 'must' : 'should'
}

const _buildProperty = (statement: Query) => {
  if (statement.type === 'datesBefore' || statement.type === 'datesAfter') {
    return toElasticDateRange(statement)
  }
  return toElasticQuery(statement)
}

const _buildQuery = (
  tokens: QueryTokens
): {
  bool: {
    must: any[]
  }
} => {
  if (isPropertyBasedQuery(tokens)) {
    const query = _buildProperty(tokens)
    return {
      bool: {
        must: [query],
      },
    }
  }
  if (Array.isArray(tokens)) {
    // Is everything just a property query? If so, they are all ANDS.
    if (tokens.every(t => !isALinkToken(t))) {
      const queries = tokens.map(_buildProperty)
      return {
        bool: {
          must: queries,
        },
      }
    }
    const threes = threeitize(tokens)
    const innerStatements = threes.map(([a, l, b]) => {
      const aSearch = _buildQuery(a as Query)
      const bSearch = _buildQuery(b as Query)
      const linker = _getBooleanFunc(l)
      return {
        bool: {
          [linker]: [aSearch, bSearch],
        },
      }
    })
    return {
      bool: {
        must: innerStatements,
      },
    }
    // Dealing with complex situation
  }
  throw new Error('Never going to get here')
}

export const toElasticSearch = (index: string, ormQuery: OrmSearch) => {
  validateOrmSearch(ormQuery)
  /*
  const booleanChains = ormQueryLib.createBooleanChains(ormQuery)
  const musts = booleanChains.ands.map(createMust)
  const shoulds = booleanChains.orChains.map(createShould)
   */

  const sort = toElasticSort(ormQuery.sort)
  const size = toElasticSize(ormQuery)
  // @ts-ignore
  const paging = toElasticPaging(ormQuery.page)

  return merge(
    { index },
    {
      body: {
        query: _buildQuery(ormQuery.query),
      },
    },
    sort,
    paging,
    size
  )
}
