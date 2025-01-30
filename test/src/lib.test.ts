import { assert } from 'chai'
import { queryBuilder } from 'functional-models'
import { toElasticSearch } from '../../src/lib'

describe('/src/lib.ts', () => {
  describe('#toElasticSearch()', () => {
    it('should produce expected query from one property', () => {
      const input = queryBuilder().property('a', 1).compile()
      const actual = toElasticSearch('my-index', input)
      const expected = {
        index: 'my-index',
        body: {
          query: {
            bool: {
              must: [
                {
                  term: {
                    a: {
                      value: 1,
                    },
                  },
                },
              ],
            },
          },
        },
      }
      // @ts-ignore
      assert.deepEqual(actual, expected)
    })
    it('should produce expected query from two properties', () => {
      const input = queryBuilder()
        .property('a', 1)
        .and()
        .property('b', 2)
        .compile()
      const actual = toElasticSearch('my-index', input)
      const expected = {
        index: 'my-index',
        body: {
          query: {
            bool: {
              must: [
                {
                  bool: {
                    must: [
                      {
                        bool: {
                          must: [
                            {
                              term: {
                                a: {
                                  value: 1,
                                },
                              },
                            },
                          ],
                        },
                      },
                      {
                        bool: {
                          must: [
                            {
                              term: {
                                b: {
                                  value: 2,
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      }
      // @ts-ignore
      assert.deepEqual(actual, expected)
    })
    it('should produce expected query from two AND properties and two OR properties', () => {
      const input = queryBuilder()
        .property('a', 1)
        .and()
        .property('b', 2)
        .and()
        .property('c', 3)
        .or()
        .property('c', 4)
        .compile()
      const actual = toElasticSearch('my-index', input)
      const expected: any = {
        index: 'my-index',
        body: {
          query: {
            bool: {
              must: [
                {
                  bool: {
                    must: [
                      {
                        bool: {
                          must: [
                            {
                              term: {
                                a: {
                                  value: 1,
                                },
                              },
                            },
                          ],
                        },
                      },
                      {
                        bool: {
                          must: [
                            {
                              term: {
                                b: {
                                  value: 2,
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  bool: {
                    must: [
                      {
                        bool: {
                          must: [
                            {
                              term: {
                                b: {
                                  value: 2,
                                },
                              },
                            },
                          ],
                        },
                      },
                      {
                        bool: {
                          must: [
                            {
                              term: {
                                c: {
                                  value: 3,
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
                {
                  bool: {
                    should: [
                      {
                        bool: {
                          must: [
                            {
                              term: {
                                c: {
                                  value: 3,
                                },
                              },
                            },
                          ],
                        },
                      },
                      {
                        bool: {
                          must: [
                            {
                              term: {
                                c: {
                                  value: 4,
                                },
                              },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        },
      }

      // @ts-ignore
      assert.deepEqual(actual, expected)
    })
  })
})
