const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
} = require("graphql");
const { GraphQLServer } = require("graphql-yoga");
const { db } = require("./persistence/db");
const { signup, login, post } = require("./resolver/mutation");

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: {
      type: GraphQLID,
    },
    name: {
      type: GraphQLString,
    },
    email: {
      type: GraphQLString,
    },
    links: {
      type: new GraphQLList(LinkType),
      resolve: (parent, _, { db }) => db.getPostByAuthor({ userId: parent.id }),
    },
  }),
});

const LinkType = new GraphQLObjectType({
  name: "Link",
  fields: {
    id: {
      type: GraphQLID,
      resolve: (root) => root.id,
    },
    url: {
      type: GraphQLString,
    },
    description: {
      type: GraphQLString,
    },
    postedBy: {
      type: UserType,
      resolve: (parent, _, { db }) => db.getPostAuthor({ id: parent.id }),
    },
  },
});

const AuthPayloadType = new GraphQLObjectType({
  name: "AuthPayload",
  fields: {
    token: {
      type: GraphQLString,
    },
    user: {
      type: UserType,
    },
  },
});

const VersionType = new GraphQLObjectType({
  name: "Version",
  fields: {
    id: {
      type: GraphQLID,
    },
    version: {
      type: GraphQLString,
      resolve: (root) => root.version,
    },
  },
});

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      info: {
        type: GraphQLString,
        resolve: () => "yolo?",
      },
      feed: {
        type: new GraphQLList(LinkType),
        resolve: (_, __, context) => {
          return context.db.findAll();
        },
      },
      link: {
        type: LinkType,
        args: {
          id: { type: GraphQLID },
        },
        resolve: (_, { id }) => db.find({ id }),
      },
      version: {
        type: VersionType,
        args: {
          id: {
            type: GraphQLID,
            description: "Die ID der Version die angefragt wird.",
          },
        },
        resolve: (root, args, context, info) => {
          console.log(args);
          return context.db.findVersionById(args);
        },
      },
    },
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: {
      signup: {
        type: AuthPayloadType,
        args: {
          name: {
            type: GraphQLString,
          },
          email: {
            type: GraphQLString,
          },
          password: {
            type: GraphQLString,
          },
        },
        resolve: signup,
      },
      login: {
        type: AuthPayloadType,
        args: {
          email: {
            type: GraphQLString,
          },
          password: {
            type: GraphQLString,
          },
        },
        resolve: login,
      },
      post: {
        type: LinkType,
        args: {
          url: {
            type: GraphQLString,
          },
          description: {
            type: GraphQLString,
          },
        },
        resolve: post,
      },
      add: {
        type: LinkType,
        args: {
          url: {
            type: GraphQLString,
            description: "if you happy and you know it clap your chair",
          },
          description: {
            type: GraphQLString,
          },
        },
        resolve: (_, args) => db.addLink(args),
      },
      delete: {
        type: LinkType,
        args: {
          id: {
            type: GraphQLID,
          },
        },
        resolve: (_, args) => db.removeLink(args),
      },
      update: {
        type: LinkType,
        args: {
          id: {
            type: GraphQLID,
            description: "the id of the link that shall be updated",
          },
          url: {
            type: GraphQLString,
            description: "if you happy and you know it clap your chair",
          },
          description: {
            type: GraphQLString,
          },
        },
        resolve: (_, args) => db.updateLink(args),
      },
    },
  }),
});

const server = new GraphQLServer({
  schema,
  context: (req) => ({
    ...req,
    db,
  }),
});

server.use((req, res, next) => {
  // todo check auth
  next();
});

server.start({ port: 4000 }, () => {
  console.log(`Server with plain gql running on http://localhost:4000`);
});
