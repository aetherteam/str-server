const upload = require("../classes/imageUpload");

async function routes(fastify, options) {
    fastify.post("/upload", async function (request, reply) {
        const result = await upload(request, reply);
        
        if (result.success) {
            reply.code(200).send(result);
        } else {
            reply.code(result.code).send(result);
        }
    });
    fastify.post("/deleteUpload", async function (request, reply) {
        // TODO: finish
        // With all security checks etc

        if (result.success) {
            reply.code(200).send(result);
        } else {
            reply.code(result.code).send(result);
        }
    });
}
module.exports = routes;

