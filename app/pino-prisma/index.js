const build = require("pino-abstract-transport");
const { PrismaClient } = require("@prisma/client");

const transport = async function (options) {
  return build(
    async function (source) {
      for await (let obj of source) {
        await prisma.log.create({
          data: {
            type: options.levels?.[obj.level] ?? "Info",
            message: obj.msg,
            expiration: null,
          },
        });
      }
    },
    {
      async close(err) {
        await prisma.close();
      },
    }
  );
};

module.exports = transport;
