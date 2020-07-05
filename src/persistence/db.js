const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function db() {
  return {
    getInfo: async () => {
      return "information"
    },
    findAllLinks: async ({ filter, orderBy, limit, start }) => {
      const where = filter ? {
        OR: [
          { description: { contains: filter } },
          { url: { contains: filter } },
        ],
      } : {}

      return await prisma.link.findMany({
        where,
        skip: start,
        take: limit,
        orderBy
      })
    },
    countAllLinks: async({ filter }) => {
      const where = filter ? {
        OR: [
          { description: { contains: filter } },
          { url: { contains: filter } },
        ],
      } : {}

      return await prisma.link.count({
        where
      })
    },
    vote: async ({ linkId, userId }) => {
      return await prisma.vote.create({ data: {
        link: { connect: { id: parseInt(linkId) } },
        user: { connect: { id: parseInt(userId) } }
      } })
    },
    getVotesByLinkId: async ({ id }) => {
      return await prisma.vote.findMany({ where: { 
        linkId: id
      }})
    },
    createUser: async (data) => {
      return await prisma.user.create({ data });
    },
    findVersionById: async ({ id }) => {
      return await prisma.version.findOne({ where: { id } });
    },
    findUserById: async ({ id }) => {
      return await prisma.user.findOne({ where: { id }})
    },
    findLinkById: async ({ id }) => {
      return await prisma.link.findOne({ where: { id }})
    },
    findUser: async ({ email }) => {
      return await prisma.user.findOne({ where: { email } });
    },
    findAll: async () => {
      const all = await prisma.link.findMany();
      return all;
    },
    find: async ({ id }) =>
      await prisma.link.findOne({ where: { id: parseInt(id) } }),
    postLink: async ({ url, description, userId }) => {
      return await prisma.link.create({
        data: { url, description, postedBy: { connect: { id: userId } } },
      });
    },
    getPostByAuthor: async ({ userId }) =>
      await prisma.link.findMany({ where: { postedById: userId } }),
    getPostAuthor: async ({ id }) => {
      console.log("get post author");
      return await prisma.link
        .findOne({ where: { id: parseInt(id) } })
        .postedBy();
    },
    addLink: async ({ url, description, userId }) => {
      return await prisma.link.create({
        data: { url, description, postedBy: { connect: { id: userId } } },
      });
    },
    updateLink: async ({ id, description, url }) => {
      return await prisma.link.update({
        where: { id: parseInt(id) },
        data: { url, description },
      });
    },
    removeLink: async ({ id }) => {
      return await prisma.link.delete({ where: { id: parseInt(id) } });
    },
  };
}

module.exports = {
  db: db(),
};
