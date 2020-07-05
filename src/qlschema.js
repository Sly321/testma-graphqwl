const { signup, login, post, remove, update } = require("./resolver/mutation");
const { feed,info, link } = require('./resolver/query')
const { makeExecutableSchema } = require('graphql-tools')
const { db } = require("./persistence/db");
const { readFileSync } = require('fs')
const { resolve } = require('path')
const Subscription = require('./resolver/subscription')

const { PubSub } = require('graphql-yoga')

const resolvers = {
  Query: {
    info,
    feed,
  },
  User: {
    links: (parent, _, { db }) => db.getPostByAuthor({ userId: parent.id }),
  },
  Link: {
    postedBy: (parent, _, { db }) => db.getPostAuthor({ id: parent.id }),
  },
  Mutation: {
    delete: remove,
    update,
    login,
    post,
    signup,
  },
  Subscription
};

const typeDefs = readFileSync(resolve(__dirname, "schema.graphql"), "utf-8")
const schema = makeExecutableSchema({ typeDefs, resolvers })

module.exports = {
  schema, pubsub: new PubSub
}