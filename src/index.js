const { GraphQLServer } = require("graphql-yoga");
const { db } = require("./persistence/db");
const { schema: classicSchema } = require("./classic");
const { schema: qlschema, pubsub } = require("./qlschema");

const server = new GraphQLServer({
  schema: classicSchema,
  context: (req) => ({
    ...req,
    db,
    pubsub
  }),
});

server.start({ port: 4000 }, () => {
  console.log(`Server with plain graphql running on http://localhost:4000`);
});

const server2 = new GraphQLServer({
  schema: qlschema,
  context: (req) => ({
    ...req,
    db,
    pubsub
  }),
});

server2.start({ port: 4001 }, () => {
  console.log(`Server with typeDef file running on http://localhost:4001`);
});