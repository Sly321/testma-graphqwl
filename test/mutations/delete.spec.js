const test = require('ava');
const { schema: plainSchema } = require("../../src/classic")
const { schema: qlSchema } = require("../../src/qlschema");
const { testSchemaValidation, createQuery } = require('../_utils');

function mutationDeleteMacro(t, schema, parameter, validation) {
    const query = createQuery({ type: "mutation", entity: "delete", parameter, returnVal: "id"})
    testSchemaValidation(t, schema, query, validation)
}

mutationDeleteMacro.title = (providedTitle = '', _, parameter, __, expected) => `${providedTitle} with parameter "${parameter}", should ${expected}`.trim();

test('schema file', mutationDeleteMacro, qlSchema, `(id: "a")`, (t, errors) => {
    t.deepEqual(errors, []);
}, "work");

test('plain schema', mutationDeleteMacro, plainSchema, `(id: "a")`, (t, errors) => {
    t.deepEqual(errors, []);
}, "work");

test('schema file', mutationDeleteMacro, qlSchema, ``, (t, errors) => {
    t.like(errors[0], { message: `Field "delete" argument "id" of type "ID!" is required, but it was not provided.` })
}, "should give 1 errrors");

test('plain schema', mutationDeleteMacro, plainSchema, ``, (t, errors) => {
    t.like(errors[0], { message: `Field "delete" argument "id" of type "ID!" is required, but it was not provided.` })
}, "should give 1 errrors");