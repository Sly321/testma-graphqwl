function info() {
    return "information"
}

function feed(_, __, { db }) {
    return db.findAll();
}

function link(_, { id }, { db }) {
    db.find({ id })
}

module.exports = {
    info, feed, link
}