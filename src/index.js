const { GraphQLServer } = require('graphql-yoga')
const { makeExecutableSchema } = require('graphql-tools')
const { parse, GraphQLObjectType } = require('graphql')

let links = [{
    id: "l1",
    url: "http://google.com",
    description: "full yolo jacket"
}]

// 1
const typeDefs = `
    type Query {
        info: String!
        feed: [Link!]!
    }

    type Link {
        id: ID!
        description: String!
        url: String!
    }
`

// 2
const resolvers = {
    Query: {
        info: () => "null",
        feed: () => links
    },
    Link: {
        id: (parent) => parent.id,
        description: (parent) => parent.description,
        url: (parent) => parent.url
    }
}

const schema = makeExecutableSchema({ resolvers, typeDefs })

// 3
const server = new GraphQLServer({
    schema
})

server.start(() => {
    console.log(`Server is running on http://localhost:4000`)
})

