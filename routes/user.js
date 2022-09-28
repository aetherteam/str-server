const User = require("../classes/user.js");
const results = require("../utils/results.js");

async function routes(fastify, options) {
  fastify.get("/user/get/", async (request, reply) => {
    const rp = request.query;

    let projection;
    if (rp?.projection) {
      projection = request.query.projection.match(/([a-z]+)/g);
    } else projection = null;

    const result = await User.get(rp.userID, projection);

    if (result.success) {
      reply.code(200).send(result);
    } else reply.code(result.code).send(result);
  });
  fastify.post("/user/createTempUser/", async (request, reply) => {
    const result = await User.createTempUser();
    if (result.success) {
      reply.code(200).send(result);
    } else reply.code(result.code).send(result);
  });
  fastify.post("/user/edit/", async (request, reply) => {
    const rp = request.body;

    const result = await User.edit(rp.userID, rp.updated);

    if (result.success) {
      reply.code(200).send(result);
    } else reply.code(result.code).send(result);
  });
  fastify.get("/user/check/", async (request, reply) => {
    const rp = request.query;

    const result = await User.getUserWithKey(rp.key);

    if (result) {
      reply.code(200).send({
        success: true,
        id: result,
        key: rp.key,
      });
    } else
      reply.code(400).send({
        success: false,
        id: null,
        key: rp.key,
      });
  });
}

module.exports = routes;
