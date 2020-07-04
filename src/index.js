const { GraphQLServer } = require("graphql-yoga");
const { signup, login, post } = require("./resolver/mutation");
const { db } = require("./persistence/db");
require("./classic");

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
    add: (_, args, { db }) => db.addLink(args),
    delete: (_, args, { db }) => db.removeLink(args),
    update: (_, args, { db }) => db.updateLink(args),
    login,
    post,
    signup,
  },
};

const server2 = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: {
    db,
  },
});

server2.start({ port: 4001 }, () => {
  console.log(`Server with typeDef file running on http://localhost:4001`);
});
