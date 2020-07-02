const { hash, compare } = require('bcryptjs')
const { sign } = require('jsonwebtoken')
const { APP_SECRET, getUserId } = require('../utils')

async function signup(_, { password, name, email }, { db }) {
    const hashedPassword = await hash(password, 10)
    const user = await db.createUser({ password: hashedPassword, name, email })
    const token = sign({ userId: user.id }, APP_SECRET)
    return {
        user, token
    }
}

async function login(_, { password, email }, { db }) {
    const user = await db.findUser({ email })
    const valid = await compare(password, user.password)

    if (!valid) {
        throw new Error("Invalid e-mail or password.")
    }

    const token = sign({ userId: user.id }, APP_SECRET)

    return {
        user, token
    }
}

async function post(_, { url, description }, { request, db }) {
    const userId = getUserId({ request })
    return db.postLink({ url, description, userId })
}

module.exports = {
    signup, login, post
}