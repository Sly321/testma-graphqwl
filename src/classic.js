const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLInputObjectType,
  GraphQLInt
} = require("graphql");
const { info, feed, link } = require("./resolver/query");
const { signup, login, post, update, remove, vote } = require("./resolver/mutation");
const { newLink } = require("./resolver/subscription");

const SortEnum = new GraphQLEnumType({
  name: "Sort",
  values: {
    asc: {
      value: "asc"
    },
    desc: {
      value: "desc"
    }
  }
})

const LinkOrderByInputType = new GraphQLInputObjectType({
  name: "LinkOrderByInput",
  fields: {
    url: {
      type: SortEnum
    },
    description: {
      type: SortEnum
    },
    createdAt: {
      type: SortEnum
    }
  }
})

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
      type: GraphQLNonNull(GraphQLList(LinkType)),
      resolve: (parent, _, { db }) => db.getPostByAuthor({ userId: parent.id }),
    },
  }),
});

const LinkType = new GraphQLObjectType({
  name: "Link",
  fields: () => ({
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
    votes: {
      type: GraphQLNonNull(GraphQLList(VoteType)),
      resolve: ({ id }, _, { db }) => {
        return db.getVotesByLinkId({ id })
      }
    },
    postedBy: {
      type: UserType,
      resolve: (parent, _, { db }) => db.getPostAuthor({ id: parent.id }),
    },
  }),
});

const FeedType = new GraphQLObjectType({
  name: "Feed",
  fields: {
    links: {
      type: GraphQLNonNull(GraphQLList(LinkType)) 
    },
    count: {
      type: GraphQLNonNull(GraphQLInt)
    }
  }
})

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

const VoteType = new GraphQLObjectType({
  name: "Vote",
  fields: {
    id: {
      type: GraphQLNonNull(GraphQLID)
    },
    link: {
      type: GraphQLNonNull(LinkType),
      resolve: (p, _, { db }) => db.findLinkById({ id: p.linkId })
    },
    user: {
      type: GraphQLNonNull(UserType),
      resolve: (p, _, { db }) => db.findUserById({ id: p.userId })
    }
  }
})

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: "Query",
    fields: {
      info: {
        type: GraphQLNonNull(GraphQLString),
        resolve: info,
      },
      feed: {
        type: GraphQLNonNull(FeedType),
        args: {
          filter: { type: GraphQLString },
          orderBy: { type: LinkOrderByInputType },
          limit: { type: GraphQLInt },
          start: { type: GraphQLInt }
        },
        resolve: feed,
      }
    },
  }),
  mutation: new GraphQLObjectType({
    name: "Mutation",
    fields: {
      signup: {
        type: AuthPayloadType,
        args: {
          name: {
            type: GraphQLNonNull(GraphQLString),
          },
          email: {
            type: GraphQLNonNull(GraphQLString),
          },
          password: {
            type: GraphQLNonNull(GraphQLString),
          },
        },
        resolve: signup,
      },
      login: {
        type: AuthPayloadType,
        args: {
          email: {
            type: GraphQLNonNull(GraphQLString),
          },
          password: {
            type: GraphQLNonNull(GraphQLString),
          },
        },
        resolve: login,
      },
      post: {
        type: LinkType,
        args: {
          url: {
            type: GraphQLNonNull(GraphQLString)
          },
          description: {
            type: GraphQLNonNull(GraphQLString),
          },
        },
        resolve: post,
      },
      delete: {
        type: LinkType,
        args: {
          id: {
            type: GraphQLNonNull(GraphQLID),
          },
        },
        resolve: remove,
      },
      update: {
        type: LinkType,
        args: {
          id: {
            type: GraphQLNonNull(GraphQLID),
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
        resolve: update,
      },
      vote: {
        type: VoteType,
        args: {
          id: {
            type: GraphQLNonNull(GraphQLID)
          }
        },
        resolve: vote
      },
    },
  }),
  subscription: new GraphQLObjectType({
    name: "Subscription",
    fields: {
      newLink: {
        type: LinkType,
        ...newLink
      }
    }
  })
});

module.exports = {
  schema
}