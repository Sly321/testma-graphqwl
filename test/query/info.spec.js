const test = require('ava');
const { stub } = require("sinon");
const { execute, parse } = require('graphql')
const { schema: plainSchema } = require("../../src/classic")
const { schema: qlSchema } = require("../../src/qlschema");
const { testSchemaValidation, createQuery } = require('../_utils');

function queryInfo(t, schema, validation) {
    const query = createQuery({ type: "query", entity: "info" })
    testSchemaValidation(t, schema, query, validation)
}

queryInfo.title = (providedTitle = '', _, __, expected) => `validate ${providedTitle} without parameter, should ${expected}`.trim();

test('schema file', queryInfo, qlSchema, (t, errors) => {
    t.deepEqual(errors, []);
}, "work");

test('plain schema', queryInfo, plainSchema, (t, errors) => {
    t.deepEqual(errors, []);
}, "work");

test.beforeEach(async (t) => {
    const db = {
        getInfo: stub()
    };
    t.context.db = db;
    db.getInfo.onFirstCall().returns(null)
});

test("execution: plain schema - return null for non nullable field", async (t) => {
    const query = createQuery({ type: "query", entity: "info" })
    const document = parse(query)
    const { errors } = await execute({ schema: plainSchema, document, contextValue: { db: t.context.db } })

    t.is(errors.length, 1)
    t.like(errors[0], { message: "Cannot return null for non-nullable field Query.info." })
})