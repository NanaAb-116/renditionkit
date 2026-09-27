[**Documentation**](../../../README.md)

---

[Documentation](../../../README.md) / [@renditionkit/repository-postgres](../README.md) / Queryable

# Interface: Queryable

Defined in: repository-postgres/src/index.ts:14

## Methods

### query()

> **query**\<`R`\>(`text`, `values?`): `Promise`\<`QueryResult`\<`R`\>\>

Defined in: repository-postgres/src/index.ts:15

#### Type Parameters

##### R

`R` _extends_ `QueryResultRow` = `QueryResultRow`

#### Parameters

##### text

`string`

##### values?

readonly `unknown`[]

#### Returns

`Promise`\<`QueryResult`\<`R`\>\>
