# Functional Models ORM Elastic

![Unit Tests](https://github.com/monolithst/functional-models-orm-elastic/actions/workflows/ut.yml/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/monolithst/functional-models-orm-elastic/badge.svg?branch=master)](https://coveralls.io/github/monolithst/functional-models-orm-elastic?branch=master)

## Run Feature Tests

To run the feature tests, you need to set up an actual Elasticsearch cluster within AWS and then call cucumber like the following:

`npm run feature-tests -- --world-parameters '{"elasticUsername":"USERNAME", "elasticPassword":"PASSWORD", "cloudId": "CLOUD_ID"}'`

IMPORTANT WORD OF CAUTION: I would not attempt to use this database for anything other than this feature tests, as the indexes are completely deleted without remorse.
