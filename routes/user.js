const User = require("../classes/user.js");
const results = require("../utils/results.js");

async function routes(fastify, options) {
    fastify.get("/user/get", async (request, reply) => {
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
    fastify.post("/user/createTempUser", async (request, reply) => {
        const result = await User.createTempUser();
        if (result.success) {
            reply.code(200).send(result);
        } else reply.code(result.code).send(result);
    });
    fastify.post("/user/edit", async (request, reply) => {
        const rp = request.body;

        const result = await User.edit(rp.userID, rp.updated);

        if (result.success) {
            reply.code(200).send(result);
        } else reply.code(result.code).send(result);
    });
}

module.exports = routes;
