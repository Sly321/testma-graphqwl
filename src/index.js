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
                    console.log("resolver", args)
                    const filtered = links.filter(link => link.id === args.id)
                    console.log("resolver", filtered)
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
// const resolvers = {
//     Query: {
//         info: () => "null",
//         feed: () => links
//     },
//     Link: {
//         id: (parent) => parent.id,
//         description: (parent) => parent.description,
//         url: (parent) => parent.url
//     }
// }

// const schema = makeExecutableSchema({ resolvers, typeDefs })

// 3
const server = new GraphQLServer({
    schema
})

server.start(() => {
    console.log(`Server is running on http://localhost:4000`)
})

