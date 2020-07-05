function info(_, __, { db }) {
    return db.getInfo()
}

function feed(_, args, { db }) {
    const links = db.findAllLinks(args);
    const count = db.countAllLinks(args);
    return { links, count };
}

module.exports = {
    info, feed
}