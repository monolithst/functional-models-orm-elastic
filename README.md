# Functional Models ORM Elastic

![Unit Tests](https://github.com/monolithst/functional-models-orm-elastic/actions/workflows/ut.yml/badge.svg?branch=master)
[![Coverage Status](https://coveralls.io/repos/github/monolithst/functional-models-orm-elastic/badge.svg?branch=master)](https://coveralls.io/github/monolithst/functional-models-orm-elastic?branch=master)

# How To Install

`npm install functional-models-orm-elastic`

# How To Use

```typescript
import { createOrm } from 'functional-models'
import { datastoreAdapter as elasticDatastore } from 'functional-models-orm-elastic'
import { Client } from '@opensearch-project/opensearch'

// Create your client.
const client = new Client({
  node: 'http://localhost:9200',
})

// Create datastoreAdapter
const datastoreAdapter = elasticDatastore.create({
  client,
})

// Create an orm for use with your models.
const orm = createOrm({ datastoreAdapter })
```

### Notes on Running with AWS OpenSearch

One way to use the client is with a username/password and the elastic url.

Here is an example:

```javascript
const url = `https://${elasticUsername}:${elasticPassword}@${elasticUrl}`

const client = new Client({
  node: url,
})
```
