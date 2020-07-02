const { GraphQLServer } = require('graphql-yoga')
const { makeExecutableSchema } = require('graphql-tools')
const { parse, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLSchema, GraphQLList, gra2 } = require('graphql')
const { PrismaClient } = require('@prisma/client')
const { signup, login, post } = require('./resolver/mutation')

const prisma = new PrismaClient()

function db() {
    return {
        createUser: async (data) => {
            return await prisma.user.create({ data })
        },
        findUser: async ({ email }) => {
            return await prisma.user.findOne({ where: { email }})
        },
        findAll: async () => {
            const all = await prisma.link.findMany()
            return all
        },
        find: async ({ id }) => await prisma.link.findOne({ where: { id: parseInt(id) } }),
        postLink: async ({ url, description, userId }) => {
            return await prisma.link.create({ data: { url, description, postedBy: { connect: { id: userId }} } })
        },
        getPostByAuthor: async ({ userId }) => await prisma.link.findMany({ where: { postedById: userId }}),
        getPostAuthor: async ({ id }) => {
            console.log("get post author")
            return await prisma.link.findOne({ where: { id: parseInt(id) } }).postedBy()
        },
        addLink: async ({ url, description, userId }) => {
            return await prisma.link.create({ data: { url, description, postedBy: { connect: { id: userId }} } })
        },
        updateLink: async ({ id, description, url  }) => {
            return await prisma.link.update({ where: { id: parseInt(id) }, data: { url, description } })
        },
        removeLink: async ({ id }) => {
            return await prisma.link.delete({ where: { id: parseInt(id) } })
        }
    }
}

// manual typing

const UserType = new GraphQLObjectType({
    name: "User",
    fields: () => ({
        id: {
            type: GraphQLID
        },
        name: {
            type: GraphQLString
        },
        email: {
            type: GraphQLString
        },
        links: {
            type: new GraphQLList(LinkType),
            resolve: (parent, _, { db }) => db.getPostByAuthor({ userId: parent.id })
        }
    })
})

const LinkType = new GraphQLObjectType({
    name: "Link",
    fields: {
        id: {
            type: GraphQLID,
            resolve: (root) => root.id
        },
        url: {
            type: GraphQLString
        },
        description: {
            type: GraphQLString
        },
        postedBy: {
            type: UserType,
            resolve: (parent, _, { db }) => db.getPostAuthor({ id: parent.id })
        }
    }
})

const AuthPayloadType = new GraphQLObjectType({
    name: "AuthPayload",
    fields: {
        token: {
            type: GraphQLString
        },
        user: {
            type: UserType
        }
    }
})

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "Query",
        fields: {
            info: {
                type: GraphQLString,
                resolve: () => "yolo?"
            },
            feed: {
                type: new GraphQLList(LinkType),
                resolve: () => db().findAll()
            },
            link: {
                type: LinkType,
                args: {
                    id: { type: GraphQLID }
                },
                resolve: (_, { id }) => db().find({ id })
            }
        }
    }),
    mutation: new GraphQLObjectType({
        name: "Mutation",
        fields: {
            signup: {
                type: AuthPayloadType,
                args: {
                    name: {
                        type: GraphQLString
                    },
                    email: {
                        type: GraphQLString
                    },
                    password: {
                        type: GraphQLString
                    }
                },
                resolve: signup
            },
            login: {
                type: AuthPayloadType,
                args: {
                    email: {
                        type: GraphQLString
                    },
                    password: {
                        type: GraphQLString
                    }
                },
                resolve: login
            },
            post: {
                type: LinkType,
                args: {
                    url: {
                        type: GraphQLString,
                    },
                    description: {
                        type: GraphQLString,
                    }
                },
                resolve: post
            },
            add: {
                type: LinkType,
                args: {
                    url: {
                        type: GraphQLString,
                        description: "if you happy and you know it clap your chair"
                    },
                    description: {
                        type: GraphQLString,
                    }
                },
                resolve: (_, args) => db().addLink(args)
            },
            delete: {
                type: LinkType,
                args: {
                    id: {
                        type: GraphQLID
                    }
                },
                resolve: (_, args) => db().removeLink(args)
            },
            update: {
                type: LinkType,
                args: {
                    id: { 
                        type: GraphQLID,
                        description: "the id of the link that shall be updated"
                    },
                    url: {
                        type: GraphQLString,
                        description: "if you happy and you know it clap your chair"
                    },
                    description: {
                        type: GraphQLString,
                    }
                },
                resolve: (_, args) => db().updateLink(args)
            }
        }
    })
})

const server = new GraphQLServer({
    schema,
    context: req => ({
        ...req,
        db: db()
    })
})

server.use((req, res, next) => {
    // todo check auth
    next()
})

server.start({ port: 4000 }, () => {
    console.log(`Server with plain gql running on http://localhost:4000`)
})

// convenient

const resolvers = {
    Query: {
        info: () => "null",
        feed: (_, __, { db }) => db.findAll()
    },
    User: {
        links: (parent, _, { db }) => db.getPostByAuthor({ userId: parent.id })
    },
    Link: {
        postedBy: (parent, _, { db }) => db.getPostAuthor({ id: parent.id })
    },
    Mutation: {
        add: (_, args, { db }) => db.addLink(args),
        delete: (_, args, { db }) => db.removeLink(args),
        update: (_, args, { db }) => db.updateLink(args),
        login,
        post,
        signup
    }
}

const server2 = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
    context: {
        db: db()
    }
})

server2.start({ port: 4001 }, () => {
    console.log(`Server with typeDef file running on http://localhost:4001`)
})

