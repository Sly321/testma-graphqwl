const { GraphQLServer } = require('graphql-yoga')
const { makeExecutableSchema } = require('graphql-tools')
const { parse, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLSchema, GraphQLList } = require('graphql')

let idIterator = 0, links = [{
    id: "" + ++idIterator,
    url: "http://addit.com",
    description: "full metal yolo"
}]

function db() {
    return {
        addLink: ({ url, description }) => {
            return links[links.push({ id: "" + ++idIterator, url, description }) - 1]
        },
        updateLink: ({ id, description, url  }) => {
            const link = links.filter(({ sId }) => sId === id)

            if (!link[0]) {
                throw new Error("link with id " + id + " not found")
            }

            if (description) {
                console.log("update description of link " + id)
                link[0].description = description
            }
            
            if (url) {
                console.log("update url of link " + id)
                link[0].url = url
            }

            return link[0]
        },
        removeLink: ({ id }) => {
            const toDel = links.findIndex(({ id: sId }) => sId === id)

            if (toDel !== -1) {
                return links.splice(toDel, 1)[0]
            }

            return null
        }
    }
}

// manual typing

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
                resolve: (root, args, context, info) => links
            },
            link: {
                type: LinkType,
                args: {
                    id: { type: GraphQLID }
                },
                resolve: (root, args, context, info) => {
                    const filtered = links.filter(link => link.id === args.id)
                    return filtered[0] || null
                },
            }
        }
    }),
    mutation: new GraphQLObjectType({
        name: "Mutation",
        fields: {
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
                resolve: (root, args) => db().updateLink(args)
            }
        }
    })
})

const server = new GraphQLServer({
    schema
})

server.start({ port: 4000 }, () => {
    console.log(`Server with plain gql running on http://localhost:4000`)
})

// convenient

const resolvers = {
    Query: {
        info: () => "null",
        feed: () => links
    },
    Link: {
        id: (parent) => parent.id,
        description: (parent) => parent.description,
        url: (parent) => parent.url
    },
    Mutation: {
        add: (_, args) => db().addLink(args),
        delete: (_, args) => db().deleteLink(args),
        update: (_, args) => db().updateLink(args)
    }
}

const server2 = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
})

server2.start({ port: 4001 }, () => {
    console.log(`Server with typeDef file running on http://localhost:4001`)
})

