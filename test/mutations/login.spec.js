const test = require('ava');
const { schema: plainSchema } = require("../../src/classic")
const { schema: qlSchema } = require("../../src/qlschema");
const { testSchemaValidation, createQuery } = require('../_utils');

function mutationLoginMacro(t, schema, parameter, validation) {
    const query = createQuery({ type: "mutation", entity: "login", parameter, returnVal: "token"})
    testSchemaValidation(t, schema, query, validation)
}

mutationLoginMacro.title = (providedTitle = '', _, parameter, __, expected) => `${providedTitle} with parameter "${parameter}", should ${expected}`.trim();

test('schema file', mutationLoginMacro, qlSchema, `(email: "a", password: "b")`, (t, errors) => {
    t.deepEqual(errors, []);
}, "work");

test('plain schema', mutationLoginMacro, plainSchema, `(email: "a", password: "b")`, (t, errors) => {
    t.deepEqual(errors, []);
}, "work");

test('schema file', mutationLoginMacro, qlSchema, ``, (t, errors) => {
    t.like(errors[0], { message: `Field "login" argument "email" of type "String!" is required, but it was not provided.` })
    t.like(errors[1], { message: `Field "login" argument "password" of type "String!" is required, but it was not provided.` })
}, "should give 2 errrors");

test('plain schema', mutationLoginMacro, plainSchema, ``, (t, errors) => {
    t.like(errors[0], { message: `Field "login" argument "email" of type "String!" is required, but it was not provided.` })
    t.like(errors[1], { message: `Field "login" argument "password" of type "String!" is required, but it was not provided.` })
}, "should give 2 errrors");