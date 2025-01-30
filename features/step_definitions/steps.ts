import { Given, Then, When } from '@cucumber/cucumber'
import { assert } from 'chai'
import {
  BooleanProperty,
  createOrm,
  DatastoreValueType,
  DateProperty,
  EqualitySymbol,
  NumberProperty,
  queryBuilder,
  SortOrder,
  TextProperty,
} from 'functional-models'
import * as datastoreAdapter from '../../src/datastoreAdapter'
import { Client } from '@opensearch-project/opensearch'

const createModels = (datastoreAdapter: any) => {
  const ormInstance = createOrm({
    datastoreAdapter: datastoreAdapter,
  })
  return {
    MODEL_1: ormInstance.Model<any>({
      pluralName: 'Model1',
      namespace: 'functional-models-orm-elastic',
      properties: {
        id: TextProperty(),
        name: TextProperty(),
        aNumber: NumberProperty(),
        aDate: DateProperty(),
        aBool: BooleanProperty(),
      },
    }),
  }
}

const DATA: any = {
  PAGE_1: () => ({
    from: 10,
  }),
  DATA_1: () => ({
    id: 'c11a4cfa-6c44-40f3-bf37-7369d9d7c929',
    name: 'test-me',
    aNumber: 1,
    aDate: '2023-01-01T00:00:01.000Z',
    aBool: true,
  }),
  DATA_2: () => [
    {
      id: '1',
      name: 'test-me-1',
      aNumber: 1,
      aDate: '2023-01-01T00:00:01.000Z',
      aBool: true,
    },
    {
      id: '2',
      name: 'test-me-2',
      aNumber: 2,
      aDate: '2023-02-01T00:00:01.000Z',
      aBool: true,
    },
    {
      id: '3',
      name: 'test-me-3',
      aNumber: 3,
      aDate: '2023-03-01T00:00:01.000Z',
      aBool: false,
    },
    {
      id: '4',
      name: 'test-me-4',
      aNumber: 4,
      aDate: '2023-04-01T00:00:01.000Z',
      aBool: false,
    },
    {
      id: '5',
      name: 'this is another',
      aDate: '2023-05-01T00:00:01.000Z',
    },
    {
      id: '6',
      name: 'the middle is good',
      aDate: '2023-06-01T00:00:01.000Z',
    },
    {
      id: '7',
      name: 'UPPER_CASE',
      aDate: '2023-06-01T00:00:01.000Z',
    },
    {
      id: '8',
      name: 'SOMETHING BIG',
      aDate: '2023-06-01T00:00:01.000Z',
    },
    {
      id: '9',
      name: 'something not big',
      aDate: '2023-06-01T00:00:01.000Z',
    },
    {
      id: '10',
      name: 'at edge',
    },
    {
      id: '11',
      name: 'not part of normal section',
    },
  ],
  DATA_2a: () => ({
    id: '1',
    name: 'test-me-1',
    aNumber: 1,
    aDate: '2023-01-01T00:00:01.000Z',
    aBool: true,
  }),
  DATA_2b: () => ({
    id: '2',
    name: 'test-me-2',
    aNumber: 2,
    aDate: '2023-02-01T00:00:01.000Z',
    aBool: true,
  }),
  DATA_2c: () => ({
    id: '3',
    name: 'test-me-3',
    aNumber: 3,
    aDate: '2023-03-01T00:00:01.000Z',
    aBool: false,
  }),
  TEXT_MATCH_SEARCH: () =>
    queryBuilder().property('name', 'test-me-2').compile(),
  CASE_TEXT_MATCH_SEARCH: () =>
    queryBuilder()
      .property('name', 'UPPER_CASE', { caseSensitive: true })
      .compile(),
  BAD_CASE_TEXT_MATCH_SEARCH: () =>
    queryBuilder()
      .property('name', 'upper_case', { caseSensitive: true })
      .compile(),
  NUMBER_RANGE_SEARCH: () =>
    queryBuilder()
      .property('aNumber', 2, {
        type: DatastoreValueType.number,
        equalitySymbol: EqualitySymbol.gte,
      })
      .and()
      .property('aNumber', 4, {
        type: DatastoreValueType.number,
        equalitySymbol: EqualitySymbol.lt,
      })
      .compile(),
  TEXT_STARTS_WITH_SEARCH: () =>
    queryBuilder().property('name', 'test-me', { startsWith: true }).compile(),
  TEXT_ENDS_WITH_SEARCH: () =>
    queryBuilder().property('name', 'me-3', { endsWith: true }).compile(),
  CASE_TEXT_ENDS_WITH_SEARCH: () =>
    queryBuilder()
      .property('name', 'BIG', { endsWith: true, caseSensitive: true })
      .compile(),
  FREE_FORM_TEXT_SEARCH: () =>
    queryBuilder()
      .property('name', 'is', { startsWith: true, endsWith: true })
      .compile(),
  BOOLEAN_SEARCH: () =>
    queryBuilder()
      .property('aBool', false, {
        type: DatastoreValueType.boolean,
      })
      .compile(),
  TWO_TEXT_SEARCH: () =>
    queryBuilder()
      .property('name', 'test-me-1')
      .and()
      .property('name', 'test-me-2')
      .compile(),
  TWO_PROPERTY_SEARCH: () =>
    queryBuilder()
      .property('name', 'test-me-1')
      .and()
      .property('aNumber', 1, { type: DatastoreValueType.number })
      .compile(),
  SIMPLE_OR_SEARCH: () =>
    queryBuilder()
      .property('name', 'test-me-1')
      .or()
      .property('name', 'test-me-2')
      .compile(),
  SIMPLE_AND_SEARCH: () =>
    queryBuilder()
      .property('name', 'test-me', { startsWith: true })
      .and()
      .property('aBool', false, { type: DatastoreValueType.boolean })
      .compile(),
  DATE_RANGE_SEARCH: () =>
    queryBuilder()
      .datesBefore('aDate', new Date('2023-05-01T00:00:01.000Z'), {})
      .and()
      .datesAfter('aDate', new Date('2023-03-01T00:00:01.000Z'), {})
      .compile(),
  SORTING_1_SEARCH: () =>
    queryBuilder()
      .property('name', 'test-me', { startsWith: true })
      .sort('name', SortOrder.dsc)
      .compile(),
  SORTING_2_SEARCH: () => {
    return queryBuilder()
      .property('name', 'test-me', { startsWith: true })
      .sort('name', SortOrder.dsc)
      .take(2)
      .compile()
  },
  EMPTY_SEARCH: () => {
    return queryBuilder().compile()
  },
  TAKE_SEARCH: () => {
    return queryBuilder().take(10).compile()
  },
  EMPTY_SEARCH_WITH_PAGE: () =>
    queryBuilder().pagination({ from: 10 }).compile(),
  COMPLEX_BOOLEAN_SEARCH: () =>
    queryBuilder()
      .property('name', 'test-me', { startsWith: true })
      .and()
      .complex(b =>
        b
          .property('aNumber', 1, { type: DatastoreValueType.number })
          .or()
          .complex(c =>
            c
              .property('aNumber', 2, { type: DatastoreValueType.number })
              .or()
              .complex(d =>
                d
                  .property('aNumber', 3, { type: DatastoreValueType.number })
                  .and()
                  .property('aBool', true, { type: DatastoreValueType.boolean })
              )
          )
      )
      .compile(),
  EMPTY_RESULT: () => [],
  SORTING_2_SEARCH_RESULTS: () => [
    {
      id: '4',
      name: 'test-me-4',
      aNumber: 4,
      aDate: '2023-04-01T00:00:01.000Z',
      aBool: false,
    },
    {
      id: '3',
      name: 'test-me-3',
      aNumber: 3,
      aDate: '2023-03-01T00:00:01.000Z',
      aBool: false,
    },
  ],
  SORTING_1_SEARCH_RESULTS: () => [
    {
      id: '4',
      name: 'test-me-4',
      aNumber: 4,
      aDate: '2023-04-01T00:00:01.000Z',
      aBool: false,
    },
    {
      id: '3',
      name: 'test-me-3',
      aNumber: 3,
      aDate: '2023-03-01T00:00:01.000Z',
      aBool: false,
    },
    {
      id: '2',
      name: 'test-me-2',
      aNumber: 2,
      aDate: '2023-02-01T00:00:01.000Z',
      aBool: true,
    },
    {
      id: '1',
      name: 'test-me-1',
      aNumber: 1,
      aDate: '2023-01-01T00:00:01.000Z',
      aBool: true,
    },
  ],
  SEARCH_RESULT_13: () => [
    {
      id: '1',
      name: 'test-me-1',
      aNumber: 1,
      aDate: '2023-01-01T00:00:01.000Z',
      aBool: true,
    },
    {
      id: '2',
      name: 'test-me-2',
      aNumber: 2,
      aDate: '2023-02-01T00:00:01.000Z',
      aBool: true,
    },
  ],
  SEARCH_RESULT_1: () => [
    {
      id: '2',
      name: 'test-me-2',
      aNumber: 2,
      aDate: '2023-02-01T00:00:01.000Z',
      aBool: true,
    },
  ],
  SEARCH_RESULT_2: () => [
    {
      id: '2',
      name: 'test-me-2',
      aNumber: 2,
      aDate: '2023-02-01T00:00:01.000Z',
      aBool: true,
    },
    {
      id: '3',
      name: 'test-me-3',
      aNumber: 3,
      aDate: '2023-03-01T00:00:01.000Z',
      aBool: false,
    },
  ],
  SEARCH_RESULT_3: () => [
    {
      id: '1',
      name: 'test-me-1',
      aNumber: 1,
      aDate: '2023-01-01T00:00:01.000Z',
      aBool: true,
    },
    {
      id: '2',
      name: 'test-me-2',
      aNumber: 2,
      aDate: '2023-02-01T00:00:01.000Z',
      aBool: true,
    },
    {
      id: '3',
      name: 'test-me-3',
      aNumber: 3,
      aDate: '2023-03-01T00:00:01.000Z',
      aBool: false,
    },
    {
      id: '4',
      name: 'test-me-4',
      aNumber: 4,
      aDate: '2023-04-01T00:00:01.000Z',
      aBool: false,
    },
  ],
  SEARCH_RESULT_4: () => [
    {
      id: '3',
      name: 'test-me-3',
      aNumber: 3,
      aDate: '2023-03-01T00:00:01.000Z',
      aBool: false,
    },
  ],
  SEARCH_RESULT_5: () => [
    {
      id: '5',
      name: 'this is another',
      aDate: '2023-05-01T00:00:01.000Z',
      aBool: null,
      aNumber: null,
    },
    {
      id: '6',
      name: 'the middle is good',
      aDate: '2023-06-01T00:00:01.000Z',
      aBool: null,
      aNumber: null,
    },
  ],
  SEARCH_RESULT_6: () => [
    {
      id: '3',
      name: 'test-me-3',
      aNumber: 3,
      aDate: '2023-03-01T00:00:01.000Z',
      aBool: false,
    },
    {
      id: '4',
      name: 'test-me-4',
      aNumber: 4,
      aDate: '2023-04-01T00:00:01.000Z',
      aBool: false,
    },
  ],
  SEARCH_RESULT_7: () => [
    {
      id: '3',
      name: 'test-me-3',
      aNumber: 3,
      aDate: '2023-03-01T00:00:01.000Z',
      aBool: false,
    },
    {
      id: '4',
      name: 'test-me-4',
      aNumber: 4,
      aDate: '2023-04-01T00:00:01.000Z',
      aBool: false,
    },
    {
      id: '5',
      name: 'this is another',
      aDate: '2023-05-01T00:00:01.000Z',
      aBool: null,
      aNumber: null,
    },
  ],
  SEARCH_RESULT_8: () => [
    {
      id: '3',
      name: 'test-me-3',
      aNumber: 3,
      aDate: '2023-03-01T00:00:01.000Z',
      aBool: false,
    },
    {
      id: '4',
      name: 'test-me-4',
      aNumber: 4,
      aDate: '2023-04-01T00:00:01.000Z',
      aBool: false,
    },
  ],
  SEARCH_RESULT_9: () => [
    {
      id: '1',
      name: 'test-me-1',
      aNumber: 1,
      aDate: '2023-01-01T00:00:01.000Z',
      aBool: true,
    },
    {
      id: '2',
      name: 'test-me-2',
      aNumber: 2,
      aDate: '2023-02-01T00:00:01.000Z',
      aBool: true,
    },
  ],
  SEARCH_RESULT_10: () => [
    {
      id: '1',
      name: 'test-me-1',
      aNumber: 1,
      aDate: '2023-01-01T00:00:01.000Z',
      aBool: true,
    },
  ],
  SEARCH_RESULT_11: () => [
    {
      id: '7',
      name: 'UPPER_CASE',
      aDate: '2023-06-01T00:00:01.000Z',
      aNumber: null,
      aBool: null,
    },
  ],
  SEARCH_RESULT_12: () => [
    {
      id: '8',
      name: 'SOMETHING BIG',
      aDate: '2023-06-01T00:00:01.000Z',
      aNumber: null,
      aBool: null,
    },
  ],
}

Given('a configured elastic client is created', function () {
  //const url = `https://${this.parameters.elasticUsername}:${this.parameters.elasticPassword}@${this.parameters.elasticUrl}`
  const url = 'http://localhost:5121'
  this.client = new Client({
    node: url,
  })
})

Given('a configured datastore adapter is created', function () {
  this.datastoreAdapter = datastoreAdapter.create({ client: this.client })
})

Given('test models are created', function () {
  this.models = createModels(this.datastoreAdapter)
})

Given(
  'the indices for models are cleared',
  { timeout: 60 * 1000 },
  async function () {
    await Object.values(this.models)
      // @ts-ignore
      .map(m => m.getName())
      .reduce(async (accP, index) => {
        index = index.toLowerCase()
        const acc = await accP
        if ((await this.client.indices.exists({ index })).statusCode !== 404) {
          await this.client.indices.delete({ index })
        }
        await this.client.indices.create({
          index,
          body: {
            mappings: {
              properties: {
                id: { type: 'keyword' },
                name: { type: 'keyword' },
                aNumber: { type: 'float' },
                aBool: { type: 'boolean' },
                aDate: { type: 'date' },
              },
            },
          },
        })
        return
      }, Promise.resolve())
  }
)

When('a {word} with {word} is created', function (modelKey, dataKey) {
  const data = DATA[dataKey]()
  const model = this.models[modelKey]
  this.modelInstance = model.create(data)
})

When('the model instance is saved', async function () {
  this.results = await this.modelInstance.save()
})

When('the model instance is deleted', async function () {
  this.results = await this.modelInstance.delete()
})

When(
  '{word} retrieve is called with the id from {word}',
  async function (modelKey, dataKey) {
    const data = DATA[dataKey]()
    this.results = await this.models[modelKey]
      .retrieve(data.id)
      .catch((e: Error) => e)
  }
)

Then('the object data matches {word}', async function (dataKey) {
  if (!this.results) {
    throw new Error(`No results to match`)
  }
  const expected = DATA[dataKey]()
  const actual = await this.results.toObj()
  assert.deepEqual(actual, expected)
})

Then('there is an error', async function () {
  assert.isTrue(this.results instanceof Error)
})

When(
  'many instances of {word} are created using {word}',
  function (modelKey, dataKey) {
    const model = this.models[modelKey]
    const data = DATA[dataKey]()
    this.modelInstances = data.map((d: any) => model.create(d))
  }
)

When(
  'bulk insert is called on {word} with the model instances',
  async function (modelKey) {
    const model = this.models[modelKey]
    this.results = await model.bulkInsert(this.modelInstances)
  }
)

When(
  'a search is called on {word} with {word}',
  async function (modelKey, dataKey) {
    const search = DATA[dataKey]()
    const model = this.models[modelKey]
    this.results = await model.search(search)
  }
)

Then('the search results matches {word}', async function (dataKey) {
  if (!this.results) {
    throw new Error(`No results were provided.`)
  }
  const expected = DATA[dataKey]().sort((x: any, y: any) => y.id - x.id)
  const actual = (
    await this.results.instances.reduce(async (accP: any, instance: any) => {
      const acc = await accP
      return acc.concat(await instance.toObj())
    }, Promise.resolve([]))
  ).sort((x: any, y: any) => y.id - x.id)
  assert.deepEqual(actual, expected)
})

Then('there are {int} instances returned', async function (count) {
  const actual = this.results.instances.length
  const expected = count
  assert.deepEqual(actual, expected)
})

Then('there is a page matching {word}', function (key: string) {
  const expected = DATA[key]()
  const actual = this.results.page
  assert.deepEqual(actual, expected)
})
