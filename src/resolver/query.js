function info() {
    return "information"
}

function feed(_, __, { db }) {
    return db.findAll();
}

module.exports = {
    info, feed
}