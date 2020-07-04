function newLinkSubscribe(parent, args, context, info) {
    console.log("newLinkSubscribe")
    return context.pubsub.asyncIterator("NEW_LINK")
}

const newLink = {
    subscribe: newLinkSubscribe,
    resolve: payload => {
        console.log("resolve")
        return payload
    },
}  

module.exports = {
    newLink
}