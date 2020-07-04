const test = require('ava');
const { schema: plainSchema } = require("../../src/classic")
const { schema: qlSchema } = require("../../src/qlschema");
const { testSchemaValidation, createQuery } = require('./../_utils');

function mutationPostMacro(t, schema, parameter, validation) {
    const query = createQuery({ type: "mutation", entity: "post", parameter, returnVal: "id"})
    testSchemaValidation(t, schema, query, validation)
}

mutationPostMacro.title = (providedTitle = '', _, parameter, __, expected) => `${providedTitle} with parameter "${parameter}", should ${expected}`.trim();

test('schema file', mutationPostMacro, qlSchema, `(url: "a", description: "b")`, (t, errors) => {
    t.deepEqual(errors, []);
}, "work");

test('qlSchema', mutationPostMacro, qlSchema,``, (t, errors) => {
    t.like(errors[0], { message: `Field "post" argument "url" of type "String!" is required, but it was not provided.` })
    t.like(errors[1], { message: `Field "post" argument "description" of type "String!" is required, but it was not provided.` })
}, "work");

test('plain', mutationPostMacro, plainSchema,`(url: "a", description: "b")`, (t, errors) => {
    t.deepEqual(errors, []);
}, "work");

test('plain', mutationPostMacro, plainSchema,``, (t, errors) => {
    t.like(errors[0], { message: `Field "post" argument "url" of type "String!" is required, but it was not provided.` })
    t.like(errors[1], { message: `Field "post" argument "description" of type "String!" is required, but it was not provided.` })
}, "work");