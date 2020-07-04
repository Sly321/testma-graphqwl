// Filename: https://github.com/avajs/ava/issues/1858#issuecomment-403284972

const {
    parse,
    validate,
} = require('graphql')

function validateSchemaToQueryAst(query, schema) {
    return validate(schema, parse(query))
}

function createQuery({ type, entity, parameter, returnVal }) {
    return `
    ${type} {
        ${entity}${parameter} ${returnVal ? `{
            ${returnVal}
        }` : ""}
    }`
}

function testSchemaValidation(t, schema, query, validation) {
	validation(t, validateSchemaToQueryAst(query, schema))
}

module.exports = {
    testSchemaValidation, createQuery
}