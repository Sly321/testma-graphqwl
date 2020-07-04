const test = require('ava');
const { schema: plainSchema } = require("../../src/classic")
const { schema: qlSchema } = require("../../src/qlschema");
const { testSchemaValidation, createQuery } = require('../_utils');

function mutationSignupMacro(t, schema, parameter, validation) {
    const query = createQuery({ type: "mutation", entity: "signup", parameter, returnVal: "token"})
    testSchemaValidation(t, schema, query, validation)
}

mutationSignupMacro.title = (providedTitle = '', _, parameter, __, expected) => `${providedTitle} with parameter "${parameter}", should ${expected}`.trim();

test('schema file', mutationSignupMacro, qlSchema, `(name: "a", email: "b", password: "c")`, (t, errors) => {
    t.deepEqual(errors, []);
}, "work");

test('plain schema', mutationSignupMacro, plainSchema, `(name: "a", email: "b", password: "c")`, (t, errors) => {
    t.deepEqual(errors, []);
}, "work");

test('schema file', mutationSignupMacro, qlSchema, ``, (t, errors) => {
    t.like(errors[0], { message: `Field "signup" argument "name" of type "String!" is required, but it was not provided.` })
    t.like(errors[1], { message: `Field "signup" argument "email" of type "String!" is required, but it was not provided.` })
    t.like(errors[2], { message: `Field "signup" argument "password" of type "String!" is required, but it was not provided.` })
}, "should give 3 errrors");

test('plain schema', mutationSignupMacro, plainSchema, ``, (t, errors) => {
    t.like(errors[0], { message: `Field "signup" argument "name" of type "String!" is required, but it was not provided.` })
    t.like(errors[1], { message: `Field "signup" argument "email" of type "String!" is required, but it was not provided.` })
    t.like(errors[2], { message: `Field "signup" argument "password" of type "String!" is required, but it was not provided.` })
}, "should give 3 errrors");