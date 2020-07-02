const { GraphQLServer } = require('graphql-yoga')
const { makeExecutableSchema } = require('graphql-tools')
const { parse, GraphQLObjectType, GraphQLString, GraphQLID, GraphQLSchema, GraphQLList } = require('graphql')

let id = 0
let links = [{
    id: "" + ++id,
    url: "http://addit.com",
    description: "full metal yolo"
}]

const LinkType = new GraphQLObjectType({
    name: "Link",
    fields: {
        id: {
            type: GraphQLID,
            resolve: () => "*******"
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
                resolve: () => {
                    return links.push({ id: "" + ++id, url: "leer", description: "naja" })
                }
            }
        }
    })
})

// 1
// const typeDefs = `
//     type Query {
//         info: String!
//         feed: [Link!]!
//     }

//     type Link {
//         id: ID!
//         description: String!
//         url: String!
//     }
// `

// // 2

// const schema = makeExecutableSchema({ resolvers, typeDefs })

// 3
const server = new GraphQLServer({
    schema
})

server.start({ port: 4000 }, () => {
    console.log(`Server with plain gql running on http://localhost:4000`)
})

// p2 

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
        add: () => {
            // funktioniert, alles andere ist dein problem
            return links[links.push({ id: "" + ++id, description: "lol", url: "unheimlich" }) - 1]
        }
    }
}

const server2 = new GraphQLServer({
    typeDefs: './src/schema.graphql',
    resolvers,
})

server2.start({ port: 4001 }, () => {
    console.log(`Server with typeDef file running on http://localhost:4001`)
})

