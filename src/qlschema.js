const { signup, login, post } = require("./resolver/mutation");
const { makeExecutableSchema } = require('graphql-tools')
const { db } = require("./persistence/db");
const { readFileSync } = require('fs')
const { resolve } = require('path')
const Subscription = require('./resolver/subscription')

const { PubSub } = require('graphql-yoga')

const resolvers = {
  Query: {
    info: () => "null",
    feed: (_, __, { db }) => db.findAll(),
  },
  User: {
    links: (parent, _, { db }) => db.getPostByAuthor({ userId: parent.id }),
  },
  Link: {
    id: (parent, args, context, info) => parent.id,
    postedBy: (parent, _, { db }) => db.getPostAuthor({ id: parent.id }),
  },
  Mutation: {
    delete: (_, args, { db }) => db.removeLink(args),
    update: (_, args, { db }) => db.updateLink(args),
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