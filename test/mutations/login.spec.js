const test = require('ava');
const { stub } = require("sinon");
const { execute, parse } = require('graphql')
const { schema: plainSchema } = require("../../src/classic")
const { schema: qlSchema } = require("../../src/qlschema");
const { testSchemaValidation, createQuery } = require('../_utils');
const { hash } = require('bcryptjs');
const { verify } = require('jsonwebtoken');
const { APP_SECRET } = require('../../src/utils');

function mutationValidateLoginMacro(t, schema, parameter, validation) {
    const query = createQuery({ type: "mutation", entity: "login", parameter, returnVal: "token"})
    testSchemaValidation(t, schema, query, validation)
}

mutationValidateLoginMacro.title = (providedTitle = '', _, parameter, __, expected) => `validate ${providedTitle} with parameter "${parameter}", should ${expected}`.trim();

test('schema file', mutationValidateLoginMacro, qlSchema, `(email: "a", password: "b")`, (t, errors) => {
    t.deepEqual(errors, []);
}, "work");

test('plain schema', mutationValidateLoginMacro, plainSchema, `(email: "a", password: "b")`, (t, errors) => {
    t.deepEqual(errors, []);
}, "work");

test('schema file', mutationValidateLoginMacro, qlSchema, ``, (t, errors) => {
    t.like(errors[0], { message: `Field "login" argument "email" of type "String!" is required, but it was not provided.` })
    t.like(errors[1], { message: `Field "login" argument "password" of type "String!" is required, but it was not provided.` })
}, "should give 2 errrors");

test('plain schema', mutationValidateLoginMacro, plainSchema, ``, (t, errors) => {
    t.like(errors[0], { message: `Field "login" argument "email" of type "String!" is required, but it was not provided.` })
    t.like(errors[1], { message: `Field "login" argument "password" of type "String!" is required, but it was not provided.` })
}, "should give 2 errrors");


test.beforeEach(async (t) => {
    const db = {
        findUser: stub()
    };
    t.context.db = db;
    db.findUser.onFirstCall().returns({ password: await hash("pw", 10) })
});

test("plain schema execution", async (t) => {
    const query = createQuery({ type: "mutation", entity: "login", parameter: `(email: "a", password: "pw")`, returnVal: "token"})
    const document = parse(query)
    const result = await execute({ schema: plainSchema, document, contextValue: { db: t.context.db } })

    t.truthy(verify(result.data.login.token, APP_SECRET))
})